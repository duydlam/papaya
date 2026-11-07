import type {
  ConfigVersionSummary,
  TenantConfig,
  TenantDetails,
  TenantPage,
} from '@papaya/contracts';
import { request } from '@/lib/api/client';
import { TENANT_PAGE_SIZE } from '../constants';

export const listTenants = (
  page = 1,
  search = '',
  excludeTenantId?: string,
) => {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(TENANT_PAGE_SIZE),
  });
  if (search) query.set('search', search);
  if (excludeTenantId) query.set('excludeTenantId', excludeTenantId);
  return request<TenantPage>(`/tenants?${query}`);
};

export const getTenant = (id: string) =>
  request<TenantDetails>(`/tenants/${id}`);

export const getTenantVersion = (tenantId: string, version: number) =>
  request<{ version: number; config: TenantConfig }>(
    `/tenants/${tenantId}/versions/${version}`,
  );

export const createTenant = (config: TenantConfig) =>
  request('/tenants', { method: 'POST', body: JSON.stringify({ config }) });

export const updateTenantConfig = (tenantId: string, config: TenantConfig) =>
  request(`/tenants/${tenantId}/config`, {
    method: 'PUT',
    body: JSON.stringify({ config }),
  });

export const archiveTenant = (tenantId: string) =>
  request<void>(`/tenants/${tenantId}`, { method: 'DELETE' });

export const listTenantVersions = (tenantId: string) =>
  request<ConfigVersionSummary[]>(`/tenants/${tenantId}/versions`);

export const restoreTenantVersion = (tenantId: string, version: number) =>
  request<void>(`/tenants/${tenantId}/versions/${version}/rollback`, {
    method: 'POST',
  });
