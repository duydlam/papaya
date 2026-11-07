'use client';

import { usePortal } from '@/components/portal-layout';
import { TenantEditor } from '@/modules/tenants/components/tenant-editor';

export default function NewTenantPage() {
  const { tenantPage, notifyError } = usePortal();
  return (
    <TenantEditor
      sampleTenantId={tenantPage.items[0]?.id}
      onError={notifyError}
    />
  );
}
