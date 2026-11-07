import { describe, expect, it } from '@jest/globals';
import { sampleTenantConfigs } from '../src/app/database/seeds/sample-tenant-configs';
import {
  TenantDetailsDto,
  TenantSummaryDto,
} from '../src/app/tenants/tenant.dto';
import type { TenantWithRequiredCurrentConfig } from '../src/app/tenants/tenant.types';

describe('tenant response DTOs', () => {
  it('maps a tenant summary from its current configuration', () => {
    const config = sampleTenantConfigs[0].config;
    const summary = TenantSummaryDto.from({
      id: 'tenant-id',
      status: 'active',
      currentVersion: 1,
      config,
    });

    expect(summary).toMatchObject({
      id: 'tenant-id',
      companyName: config.branding.companyName,
      enabledClaimTypes: ['OUTPATIENT', 'INPATIENT', 'DENTAL'],
    });
    expect(summary).not.toHaveProperty('config');
  });

  it('includes the configuration in tenant details', () => {
    const config = sampleTenantConfigs[0].config;
    const details = TenantDetailsDto.from({
      id: 'tenant-id',
      status: 'active',
      currentVersion: 1,
      config,
    });

    expect(details.config).toBe(config);
    expect(details.companyName).toBe(config.branding.companyName);
  });

  it('maps entity arrays with current configuration', () => {
    const config = sampleTenantConfigs[0].config;
    const [details] = TenantDetailsDto.fromEntities([
      {
        id: 'tenant-id',
        status: 'active',
        currentVersion: 1,
        currentConfig: { config },
      } as TenantWithRequiredCurrentConfig,
    ]);

    expect(details).toMatchObject({
      id: 'tenant-id',
      companyName: config.branding.companyName,
      config,
    });
  });
});
