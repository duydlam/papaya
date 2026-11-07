import { useCallback, useState } from 'react';
import _ from 'lodash';
import type { ConfigDiffEntry, TenantSummary } from '@papaya/contracts';
import { compareTenants } from '../api/compare.api';
import { CONFIG_DIFF_GROUPS } from '../constants';
import { getDiffGroupKey } from '../utils/diff.utils';

export function useTenantCompare(onError: (error: unknown) => void) {
  const [left, setLeft] = useState<TenantSummary>();
  const [right, setRight] = useState<TenantSummary>();
  const [diff, setDiff] = useState<ConfigDiffEntry[]>();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const compare = useCallback(async () => {
    if (!left || !right || left.id === right.id) return;
    setLoading(true);
    try {
      const result = await compareTenants(left.id, right.id);
      setDiff(result.differences);
      const firstChangedGroup = _.findIndex(CONFIG_DIFF_GROUPS, ([key]) =>
        _.some(
          result.differences,
          (entry) => getDiffGroupKey(entry.path) === key,
        ),
      );
      setStep(firstChangedGroup < 0 ? 1 : firstChangedGroup + 1);
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  }, [left, onError, right]);

  const selectTenant = useCallback(
    (side: 'left' | 'right', tenant?: TenantSummary) => {
      if (side === 'left') setLeft(tenant);
      else setRight(tenant);
      setDiff(undefined);
      setStep(0);
    },
    [],
  );

  return { left, right, diff, step, setStep, loading, compare, selectTenant };
}
