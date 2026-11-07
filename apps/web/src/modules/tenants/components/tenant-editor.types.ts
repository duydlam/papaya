import type { TenantConfig } from '@papaya/contracts';

export type TenantConfigUpdate = (
  update: (draft: TenantConfig) => void,
) => void;

export type TenantConfigStepProps = {
  config: TenantConfig;
  readOnly: boolean;
  updateConfig: TenantConfigUpdate;
};
