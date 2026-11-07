import { describe, expect, it } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { sampleTenantConfigs } from '../src/app/database/seeds/sample-tenant-configs';
import {
  validateClaimFieldValues,
  validateTenantConfig,
} from '../src/app/tenant-config/tenant-config.validator';

describe('tenant configuration validation', () => {
  it('accepts the three seeded configurations', () => {
    for (const { config } of sampleTenantConfigs) {
      expect(() => validateTenantConfig(config)).not.toThrow();
    }
  });

  it('rejects approval bands with a gap', () => {
    const config = structuredClone(sampleTenantConfigs[0].config);
    config.approval.bands[1].minAmount = 100_002;

    expect(() => validateTenantConfig(config)).toThrow(BadRequestException);
  });

  it('returns independent validation errors together', () => {
    const config = structuredClone(sampleTenantConfigs[0].config);
    config.claimTypes.OUTPATIENT.enabled = 'yes' as unknown as boolean;
    config.claimTypes.OUTPATIENT.requiredDocuments =
      null as unknown as string[];
    config.notifications.claim_submitted.emailTemplate =
      42 as unknown as string;

    let response: unknown;
    try {
      validateTenantConfig(config);
    } catch (error) {
      response = (error as BadRequestException).getResponse();
    }

    expect(response).toMatchObject({
      message: expect.arrayContaining([
        'claimTypes.OUTPATIENT.enabled must be a boolean',
        'claimTypes.OUTPATIENT.requiredDocuments must be a list of non-empty strings',
        'notifications.claim_submitted.emailTemplate must be text or null',
      ]),
    });
  });

  it('validates required and bounded custom field values', () => {
    const config = sampleTenantConfigs[0].config;

    expect(() => validateClaimFieldValues(config.customFields, {})).toThrow(
      BadRequestException,
    );
    expect(() =>
      validateClaimFieldValues(config.customFields, {
        employee_id: '  EMP-15  ',
      }),
    ).not.toThrow();
  });

  it('rejects unknown custom field keys instead of dropping them', () => {
    expect(() =>
      validateClaimFieldValues(sampleTenantConfigs[0].config.customFields, {
        employee_id: 'EMP-15',
        employee_code: 'typo',
      }),
    ).toThrow(BadRequestException);
  });
});
