import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import { sampleTenantConfigs } from '../src/app/database/seeds/sample-tenant-configs';
import { ClaimProcessingService } from '../src/app/claim-processing/claim-processing.service';
import { MockNotificationService } from '../src/app/claim-processing/mock-notification.service';
import { TenantService } from '../src/app/tenants/tenant.service';

describe('MockNotificationService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs each mock send with the channel payload and email template', async () => {
    const log = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => {});
    const config = structuredClone(sampleTenantConfigs[0].config);
    config.notifications.claim_submitted.emailTemplate = 'Claim {{claimType}}';
    const tenantService = {
      get: jest.fn<() => Promise<unknown>>().mockResolvedValue({
        id: '00000000-0000-4000-8000-000000000001',
        currentVersion: 1,
        config,
      }),
    } as unknown as TenantService;
    const processing = new ClaimProcessingService(tenantService);
    const result = await processing.evaluate({
      tenantId: '00000000-0000-4000-8000-000000000001',
      claimType: 'OUTPATIENT',
      amount: 15_000,
      submittedDate: '2026-11-06',
      customFieldValues: { employee_id: 'EMP-15' },
    });

    const deliveries = new MockNotificationService().send(result);

    expect(deliveries).toHaveLength(2);
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining('"employee_id":"EMP-15"'),
    );
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining('"emailTemplate":"Claim {{claimType}}"'),
    );
  });
});
