'use client';

import { useParams } from 'next/navigation';
import { usePortal } from '@/components/portal-layout';
import { History } from '@/modules/tenants/components/tenant-history';

export default function TenantHistoryPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const { notifyError } = usePortal();
  return <History tenantId={tenantId} onError={notifyError} />;
}
