import type { ConfigDiffEntry } from '@papaya/contracts';
import { request } from '@/lib/api/client';

export const compareTenants = (leftTenantId: string, rightTenantId: string) => {
  const query = new URLSearchParams({ leftTenantId, rightTenantId });
  return request<{ differences: ConfigDiffEntry[] }>(
    `/tenants/compare?${query}`,
  );
};
