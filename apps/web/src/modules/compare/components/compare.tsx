'use client';

import { PageTitle } from '@/components/portal-ui';
import { useTenantCompare } from '../hooks/use-tenant-compare';
import { CompareResults } from './compare-results';
import { CompareSelection } from './compare-selection';
import { CompareStepper } from './compare-stepper';

export function Compare({ onError }: { onError: (error: unknown) => void }) {
  const { left, right, diff, step, setStep, loading, compare, selectTenant } =
    useTenantCompare(onError);
  const sameTenant = Boolean(left && right && left.id === right.id);

  return (
    <>
      <PageTitle
        eyebrow="CONFIGURATION REVIEW"
        title="Compare tenants"
        description="Choose two partners to see how their rules differ."
      />
      <CompareStepper diff={diff} step={step} setStep={setStep} />
      {step === 0 && (
        <CompareSelection
          left={left}
          right={right}
          loading={loading}
          sameTenant={sameTenant}
          onSelect={selectTenant}
          onCompare={() => void compare()}
          onError={onError}
        />
      )}
      {step > 0 && diff && left && right && (
        <CompareResults
          left={left}
          right={right}
          diff={diff}
          step={step}
          setStep={setStep}
        />
      )}
    </>
  );
}
