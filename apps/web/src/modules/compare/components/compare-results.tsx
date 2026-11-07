import _ from 'lodash';
import type { ConfigDiffEntry, TenantSummary } from '@papaya/contracts';
import { COMPARE_STEPS, CONFIG_DIFF_GROUPS } from '../constants';
import { getDiffGroupKey } from '../utils/diff.utils';
import { CompareGroup } from './compare-diff';

export function CompareResults({
  left,
  right,
  diff,
  step,
  setStep,
}: {
  left: TenantSummary;
  right: TenantSummary;
  diff: ConfigDiffEntry[];
  step: number;
  setStep: (step: number) => void;
}) {
  const groupedDiff = _.groupBy(diff, (entry) => getDiffGroupKey(entry.path));
  const activeGroup = CONFIG_DIFF_GROUPS[step - 1] ?? CONFIG_DIFF_GROUPS[0];

  return (
    <section className="panel diff-list">
      <div className="diff-summary">
        <div>
          <p className="eyebrow">CURRENT CONFIGURATIONS</p>
          <h2>
            {diff.length
              ? `${diff.length} differences found`
              : 'Configurations match'}
          </h2>
          <p className="muted">
            {left.companyName} v{left.currentVersion} → {right.companyName} v
            {right.currentVersion}
          </p>
        </div>
        <button
          className="button secondary"
          type="button"
          onClick={() => setStep(0)}
        >
          Change tenants
        </button>
      </div>
      <p className="diff-legend">
        Green marks added items; red marks removed items. Number changes are
        measured from the baseline.
      </p>
      <CompareGroup
        group={activeGroup}
        entries={groupedDiff[activeGroup[0]] ?? []}
        leftName={left.companyName}
        rightName={right.companyName}
      />
      <div className="compare-step-actions">
        <button
          className="button secondary"
          type="button"
          disabled={step <= 1}
          onClick={() => setStep(step - 1)}
        >
          Previous step
        </button>
        <button
          className="button secondary"
          type="button"
          disabled={step >= COMPARE_STEPS.length - 1}
          onClick={() => setStep(step + 1)}
        >
          Next step
        </button>
      </div>
    </section>
  );
}
