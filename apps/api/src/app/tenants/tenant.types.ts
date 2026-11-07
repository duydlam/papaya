import type { TenantConfig } from '@papaya/contracts';
import type { TenantConfigVersion } from '../tenant-config/tenant-config-version.entity';
import type { Tenant } from './tenant.entity';

export type TenantSummarySource = Pick<
  Tenant,
  'id' | 'status' | 'currentVersion'
> & { config: TenantConfig };

export type TenantSummaryRow = Omit<TenantSummarySource, 'config'> & {
  config: TenantConfig | null;
};

export type TenantWithCurrentConfig = Tenant & {
  currentConfig?: TenantConfigVersion;
};

export type TenantWithRequiredCurrentConfig = Tenant & {
  currentConfig: TenantConfigVersion;
};
