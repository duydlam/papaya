import { useCallback, useEffect, useRef, useState } from 'react';
import type { ConfigVersionSummary } from '@papaya/contracts';
import {
  getTenant,
  listTenantVersions,
  restoreTenantVersion,
} from '../api/tenant.api';

export function useTenantHistory(
  tenantId: string,
  onError: (error: unknown) => void,
) {
  const [versions, setVersions] = useState<ConfigVersionSummary[]>([]);
  const [company, setCompany] = useState('');
  const [busy, setBusy] = useState(false);
  const latestRequest = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++latestRequest.current;
    try {
      const [items, detail] = await Promise.all([
        listTenantVersions(tenantId),
        getTenant(tenantId),
      ]);
      if (requestId !== latestRequest.current) return;
      setVersions(items);
      setCompany(detail.companyName);
    } catch (error) {
      if (requestId === latestRequest.current) onError(error);
    }
  }, [tenantId, onError]);

  useEffect(() => {
    void load();
    return () => {
      latestRequest.current += 1;
    };
  }, [load]);

  const restore = useCallback(
    async (version: number) => {
      setBusy(true);
      try {
        await restoreTenantVersion(tenantId, version);
        await load();
      } catch (error) {
        onError(error);
      } finally {
        setBusy(false);
      }
    },
    [load, onError, tenantId],
  );

  return { versions, company, busy, restore };
}
