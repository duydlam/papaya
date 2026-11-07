import type { TenantSummary } from '@papaya/contracts';
import { Button } from '@/components/portal-ui';
import { CompareTenantPicker } from './compare-picker';

export function CompareSelection({
  left,
  right,
  loading,
  sameTenant,
  onSelect,
  onCompare,
  onError,
}: {
  left?: TenantSummary;
  right?: TenantSummary;
  loading: boolean;
  sameTenant: boolean;
  onSelect: (side: 'left' | 'right', tenant?: TenantSummary) => void;
  onCompare: () => void;
  onError: (error: unknown) => void;
}) {
  return (
    <form
      className="panel compare-form"
      onSubmit={(event) => {
        event.preventDefault();
        onCompare();
      }}
    >
      <fieldset className="compare-inputs" disabled={loading}>
        <div className="compare-selection-grid">
          <CompareTenantPicker
            label="Baseline tenant"
            value={left}
            excludeTenantId={right?.id}
            onChange={(tenant) => onSelect('left', tenant)}
            onError={onError}
          />
          <span className="compare-vs" aria-hidden="true">
            →
          </span>
          <CompareTenantPicker
            label="Compare with"
            value={right}
            excludeTenantId={left?.id}
            onChange={(tenant) => onSelect('right', tenant)}
            onError={onError}
          />
        </div>
      </fieldset>
      <div className="compare-form-footer">
        <p className="muted">
          {sameTenant
            ? 'Choose two different tenants to compare their rules.'
            : 'Changes are measured from the baseline tenant.'}
        </p>
        <Button
          type="submit"
          disabled={!left || !right || sameTenant || loading}
        >
          {loading ? 'Comparing…' : 'Compare tenants'}
        </Button>
      </div>
    </form>
  );
}
