'use client';

import { useState } from 'react';
import { usePortal } from '@/components/portal-layout';
import { TenantDirectory } from '@/modules/tenants/components/tenant-directory';

export default function Page() {
  const { tenantPage, loading, loadTenants, notifyError } = usePortal();
  const [busy, setBusy] = useState(false);

  return (
    <TenantDirectory
      tenantPage={tenantPage}
      loading={loading}
      onPageChange={(page, search) => void loadTenants(page, search)}
      onRefresh={loadTenants}
      onError={notifyError}
      busy={busy}
      setBusy={setBusy}
    />
  );
}
