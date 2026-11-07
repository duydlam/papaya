import { useCallback, useEffect, useRef, useState } from 'react';
import type { TenantPage } from '@papaya/contracts';
import { listTenants } from '../api/tenant.api';
import { TENANT_PAGE_SIZE } from '../constants';

export function useTenantDirectory(onError: (error: unknown) => void) {
  const [tenantPage, setTenantPage] = useState<TenantPage>({
    items: [],
    page: 1,
    pageSize: TENANT_PAGE_SIZE,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const latestRequest = useRef(0);

  const loadTenants = useCallback(
    async (page = 1, search = '') => {
      const requestId = ++latestRequest.current;
      setLoading(true);
      try {
        const result = await listTenants(page, search);
        if (requestId === latestRequest.current) setTenantPage(result);
      } catch (error) {
        if (requestId === latestRequest.current) onError(error);
      } finally {
        if (requestId === latestRequest.current) setLoading(false);
      }
    },
    [onError],
  );

  useEffect(() => {
    void loadTenants();
  }, [loadTenants]);

  return { tenantPage, loading, loadTenants };
}
