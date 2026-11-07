import _ from 'lodash';
import type { ConfigDiffEntry } from '@papaya/contracts';
import { COMPARE_STEPS } from '../constants';
import { getDiffGroupKey } from '../utils/diff.utils';

export function CompareStepper({
  diff,
  step,
  setStep,
}: {
  diff?: ConfigDiffEntry[];
  step: number;
  setStep: (step: number) => void;
}) {
  const groupedDiff = _.groupBy(diff ?? [], (entry) =>
    getDiffGroupKey(entry.path),
  );

  return (
    <nav className="config-stepper compare-stepper" aria-label="Compare steps">
      <div className="stepper-list">
        {_.map(COMPARE_STEPS, ({ key, title }, index) => {
          const count = key ? (groupedDiff[key]?.length ?? 0) : 0;
          return (
            <button
              key={title}
              className={`stepper-step${step === index ? ' active' : ''}${step > index ? ' complete' : ''}${count ? ' has-differences' : ''}`}
              type="button"
              aria-current={step === index ? 'step' : undefined}
              disabled={index > 0 && !diff}
              onClick={() => setStep(index)}
            >
              <span className="step-number">
                {step > index ? '✓' : index + 1}
              </span>
              <span className="step-label">
                {title}
                {diff && (
                  <small className={`step-status${count ? ' changed' : ''}`}>
                    {key
                      ? count
                        ? `${count} ${count === 1 ? 'change' : 'changes'}`
                        : 'No changes'
                      : 'Tenants selected'}
                  </small>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <span className="step-count">
        Step {step + 1} of {COMPARE_STEPS.length}
      </span>
    </nav>
  );
}
