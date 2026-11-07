'use client';

import { useParams } from 'next/navigation';
import { usePortal } from '@/components/portal-layout';
import { TenantEditor } from '@/modules/tenants/components/tenant-editor';

export default function TenantConfigPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const { notifyError } = usePortal();
  return <TenantEditor tenantId={tenantId} onError={notifyError} />;
}
