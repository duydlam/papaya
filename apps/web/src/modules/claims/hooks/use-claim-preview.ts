import { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import { usePathname } from 'next/navigation';
import type {
  ClaimProcessingResult,
  TenantConfig,
  TenantDetails,
  TenantSummary,
} from '@papaya/contracts';
import { CLAIM_TYPES, DEFAULT_CLAIM } from '../constants';
import { getTenant } from '@/modules/tenants/api/tenant.api';
import { processClaim } from '../api/claim-processing.api';

export function useClaimPreview(onError: (error: unknown) => void) {
  const pathname = usePathname();
  const queryTenant =
    typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('tenant') ?? '')
      : '';
  const [tenant, setTenant] = useState<TenantSummary>();
  const [tenantId, setTenantId] = useState(queryTenant);
  const [input, setInput] = useState(DEFAULT_CLAIM);
  const [result, setResult] = useState<ClaimProcessingResult>();
  const [submitting, setSubmitting] = useState<'preview' | 'process' | null>(
    null,
  );
  const [selectedConfig, setSelectedConfig] = useState<TenantConfig>();

  const updateInput = useCallback((nextInput: typeof input) => {
    setInput(nextInput);
    setResult(undefined);
  }, []);

  useEffect(() => {
    if (pathname === '/claims' && queryTenant) setTenantId(queryTenant);
  }, [pathname, queryTenant]);

  useEffect(() => {
    setSelectedConfig(undefined);
    setResult(undefined);
    if (!tenantId) return;
    let active = true;
    void getTenant(tenantId)
      .then((data: TenantDetails) => {
        if (!active) return;
        setTenant(data);
        setSelectedConfig(data.config);
        const enabled = _.filter(
          CLAIM_TYPES,
          (type) => data.config.claimTypes[type].enabled,
        );
        setInput((current) =>
          enabled.length && !_.includes(enabled, current.claimType)
            ? { ...current, claimType: enabled[0] }
            : current,
        );
      })
      .catch((error) => active && onError(error));
    return () => {
      active = false;
    };
  }, [tenantId, onError]);

  const submit = useCallback(
    async (mode: 'preview' | 'process') => {
      if (!tenantId) return onError(new Error('Select a tenant first'));
      if (!Number.isSafeInteger(input.amount) || input.amount < 0)
        return onError(new Error('Amount must be a non-negative whole number'));
      setSubmitting(mode);
      setResult(undefined);
      try {
        setResult(await processClaim({ ...input, tenantId }, mode));
      } catch (error) {
        onError(error);
      } finally {
        setSubmitting(null);
      }
    },
    [input, onError, tenantId],
  );

  return {
    tenant,
    tenantId,
    setTenant,
    setTenantId,
    input,
    result,
    submitting,
    selectedConfig,
    updateInput,
    submit,
  };
}
