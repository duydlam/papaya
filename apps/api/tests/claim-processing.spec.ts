import { describe, expect, it, jest } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import type { TenantConfig } from '@papaya/contracts';
import { TenantService } from '../src/app/tenants/tenant.service';
import { sampleTenantConfigs } from '../src/app/database/seeds/sample-tenant-configs';
import { ClaimProcessingService } from '../src/app/claim-processing/claim-processing.service';
import { ClaimPreviewDto } from '../src/app/claim-processing/claim-processing.dto';
import { addBusinessDays } from '../src/app/claim-processing/claim-processing.utils';

const serviceFor = (config: TenantConfig) =>
  new ClaimProcessingService({
    get: jest.fn<() => Promise<unknown>>().mockResolvedValue({
      id: '00000000-0000-4000-8000-000000000001',
      currentVersion: 1,
      config,
    }),
  } as unknown as TenantService);

const claim = {
  tenantId: '00000000-0000-4000-8000-000000000001',
  claimType: 'OUTPATIENT' as const,
  amount: 15_000,
  submittedDate: '2026-11-06',
  customFieldValues: { employee_id: 'EMP-15' },
};

const valuesFor = (config: TenantConfig) =>
  Object.fromEntries(
    config.customFields.map((field) => [
      field.key,
      field.type === 'number'
        ? (field.min ?? 0)
        : field.type === 'date'
          ? (field.minDate ?? '2026-01-01')
          : field.type === 'boolean'
            ? true
            : field.type === 'select'
              ? (field.options?.[0].value ?? '')
              : 'AUDIT-001',
    ]),
  );

describe('ClaimProcessingService', () => {
  it('routes the same claim differently for all sample tenants', async () => {
    const results = await Promise.all(
      sampleTenantConfigs.map(({ config }) =>
        serviceFor(config).evaluate({
          ...claim,
          customFieldValues: valuesFor(config),
        }),
      ),
    );

    expect(results.map(({ approval }) => approval)).toMatchObject([
      { status: 'auto_approved', approverRole: null },
      { status: 'pending_approval', approverRole: 'assessor' },
      { status: 'pending_approval', approverRole: 'committee' },
    ]);
    expect(results[0].notifications.map(({ event }) => event)).toEqual([
      'claim_submitted',
      'approved',
    ]);
    expect(results[1].notifications.map(({ event }) => event)).toEqual([
      'claim_submitted',
    ]);
    expect(results[0].approval.autoApprovalThreshold).toBe(20_000);
  });

  it.each([
    [20_000, 'assessor'],
    [100_000, 'assessor'],
    [100_001, 'team_lead'],
    [500_000, 'team_lead'],
    [500_001, 'director'],
  ])('routes amount %s to %s at band boundaries', async (amount, role) => {
    const result = await serviceFor(sampleTenantConfigs[0].config).evaluate({
      ...claim,
      amount,
    });
    expect(result.approval.approverRole).toBe(role);
  });

  it('omits SLA output for SafeGuard dental claims', async () => {
    const result = await serviceFor(sampleTenantConfigs[0].config).evaluate({
      ...claim,
      claimType: 'DENTAL',
      amount: 15_000,
    });
    expect(result.sla).toBeNull();
  });

  it('trims text custom-field values in the evaluation result', async () => {
    const result = await serviceFor(sampleTenantConfigs[0].config).evaluate({
      ...claim,
      customFieldValues: { employee_id: '  EMP-15  ' },
    });
    expect(result.customFieldValues.employee_id).toBe('EMP-15');
  });

  it('omits blank optional custom values from results and mock payloads', async () => {
    const config = structuredClone(sampleTenantConfigs[0].config);
    config.customFields.push({
      key: 'claim_note',
      label: 'Claim note',
      type: 'text',
      required: false,
      maxLength: 255,
    });
    const result = await serviceFor(config).evaluate({
      ...claim,
      customFieldValues: { employee_id: 'EMP-15', claim_note: '' },
    });

    expect(result.customFieldValues).toEqual({ employee_id: 'EMP-15' });
  });

  it.each([Number.MAX_SAFE_INTEGER + 1, ''])(
    'rejects invalid claim amount %s at the request boundary',
    (amount) => {
      const dto = plainToInstance(ClaimPreviewDto, { ...claim, amount });
      expect(
        validateSync(dto).some(({ property }) => property === 'amount'),
      ).toBe(true);
    },
  );

  it('counts weekdays from the business day after submission', () => {
    expect(addBusinessDays('2026-11-06', 1)).toBe('2026-11-09');
    expect(addBusinessDays('2026-11-06', 5)).toBe('2026-11-13');
    expect(addBusinessDays('2026-11-07', 5)).toBe('2026-11-13');
  });

  it('rejects an SLA deadline outside the supported date range', () => {
    expect(() =>
      addBusinessDays('2026-11-06', Number.MAX_SAFE_INTEGER),
    ).toThrow('SLA deadline is outside the supported date range');
  });
});
