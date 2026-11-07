'use client';

import type { TenantSummary } from '@papaya/contracts';
import { TenantPicker } from '@/modules/tenants/components/tenant-picker';

export function CompareTenantPicker({
  label,
  value,
  excludeTenantId,
  onChange,
  onError,
}: {
  label: string;
  value?: TenantSummary;
  excludeTenantId?: string;
  onChange: (tenant?: TenantSummary) => void;
  onError: (error: unknown) => void;
}) {
  return (
    <div className="compare-picker-card">
      <TenantPicker
        label={label}
        value={value}
        excludeTenantId={excludeTenantId}
        onChange={onChange}
        onError={onError}
      />
    </div>
  );
}
