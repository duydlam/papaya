'use client';

import { usePortal } from '@/components/portal-layout';
import { ClaimPreview } from '@/modules/claims/components/claim-preview';

export default function ClaimsPage() {
  const { notifyError } = usePortal();
  return <ClaimPreview onError={notifyError} />;
}
