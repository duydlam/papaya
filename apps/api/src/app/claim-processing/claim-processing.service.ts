import { BadRequestException, Injectable } from '@nestjs/common';
import _ from 'lodash';
import type {
  ClaimPreviewInput,
  ClaimProcessingResult,
  ClaimTypeConfig,
  CustomFieldDefinition,
  NotificationEvent,
  TenantConfig,
} from '@papaya/contracts';
import { TenantService } from '../tenants/tenant.service';
import { validateClaimFieldValues } from '../tenant-config/tenant-config.validator';
import { addBusinessDays } from './claim-processing.utils';

@Injectable()
export class ClaimProcessingService {
  constructor(private readonly tenants: TenantService) {}

  async evaluate(input: ClaimPreviewInput): Promise<ClaimProcessingResult> {
    const tenant = await this.tenants.get(input.tenantId);
    const claimConfig = this.getEnabledClaimConfig(
      input.claimType,
      tenant.config.claimTypes[input.claimType],
    );
    const customFieldValues = this.normalizeCustomFieldValues(
      tenant.config.customFields,
      input.customFieldValues ?? {},
    );
    const approval = this.resolveApproval(input.amount, tenant.config.approval);

    return {
      tenantId: tenant.id,
      configVersion: tenant.currentVersion,
      claimType: input.claimType,
      amount: input.amount,
      submittedDate: input.submittedDate,
      approval,
      documents: {
        required: claimConfig.requiredDocuments,
        optional: claimConfig.optionalDocuments,
      },
      notifications: this.buildNotifications(
        tenant.config,
        approval.status === 'auto_approved',
      ),
      sla: this.buildSla(claimConfig, input.submittedDate),
      customFields: tenant.config.customFields,
      customFieldValues,
    };
  }

  private getEnabledClaimConfig(
    claimType: ClaimPreviewInput['claimType'],
    claimConfig: ClaimTypeConfig,
  ): ClaimTypeConfig {
    if (!claimConfig?.enabled)
      throw new BadRequestException(
        `${claimType} is not enabled for this tenant`,
      );
    return claimConfig;
  }

  private normalizeCustomFieldValues(
    definitions: CustomFieldDefinition[],
    values: ClaimPreviewInput['customFieldValues'],
  ) {
    validateClaimFieldValues(definitions, values);
    const fieldsByKey = _.keyBy(definitions, 'key');
    return _.mapValues(
      _.pick(
        _.pickBy(values, (value) => !_.isNil(value) && value !== ''),
        _.keys(fieldsByKey),
      ),
      (value, key) =>
        fieldsByKey[key].type === 'text' && _.isString(value)
          ? _.trim(value)
          : value,
    );
  }

  private resolveApproval(
    amount: number,
    config: TenantConfig['approval'],
  ): ClaimProcessingResult['approval'] {
    const autoApprovalThreshold = config.autoApprovalThreshold;
    if (amount < autoApprovalThreshold)
      return {
        status: 'auto_approved',
        approverRole: null,
        autoApprovalThreshold,
      };

    const approvalBand = _.find(
      config.bands,
      ({ minAmount, maxAmount }) =>
        amount >= minAmount && (maxAmount === null || amount <= maxAmount),
    );
    if (!approvalBand)
      throw new BadRequestException(
        'No approval band matches the claim amount',
      );

    return {
      status: 'pending_approval',
      approverRole: approvalBand.role,
      autoApprovalThreshold,
    };
  }

  private buildNotifications(
    config: TenantConfig,
    automaticallyApproved: boolean,
  ): ClaimProcessingResult['notifications'] {
    const events: NotificationEvent[] = ['claim_submitted'];
    if (automaticallyApproved) events.push('approved');
    return _.map(events, (event) => ({
      event,
      channels: config.notifications[event].channels,
      emailTemplate: config.notifications[event].emailTemplate,
    }));
  }

  private buildSla(
    claimConfig: ClaimTypeConfig,
    submittedDate: string,
  ): ClaimProcessingResult['sla'] {
    if (!claimConfig.sla) return null;
    return {
      businessDays: claimConfig.sla.businessDays,
      deadline: addBusinessDays(submittedDate, claimConfig.sla.businessDays),
      escalationRole: claimConfig.sla.escalationRole,
    };
  }
}
