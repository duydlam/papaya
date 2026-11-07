'use client';

import { usePortal } from '@/components/portal-layout';
import { Compare } from '@/modules/compare/components/compare';

export default function ComparePage() {
  const { notifyError } = usePortal();
  return <Compare onError={notifyError} />;
}
