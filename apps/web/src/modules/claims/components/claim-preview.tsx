'use client';

import Link from 'next/link';
import { Button, PageTitle } from '@/components/portal-ui';
import { Select } from '@/components/select';
import { ClaimCustomFields } from './claim-custom-fields';
import { ClaimResultCard } from './claim-result-card';
import { CLAIM_TYPES } from '../constants';
import { TenantPicker } from '@/modules/tenants/components/tenant-picker';
import { useClaimPreview } from '../hooks/use-claim-preview';

export function ClaimPreview({
  onError,
}: {
  onError: (error: unknown) => void;
}) {
  const {
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
  } = useClaimPreview(onError);
  const enabledClaimTypes = CLAIM_TYPES.filter(
    (type) => selectedConfig?.claimTypes[type].enabled,
  );
  return (
    <>
      <PageTitle
        eyebrow="CLAIM WORKBENCH"
        title="Claim preview"
        description="Evaluate a synthetic claim against a tenant’s current rules."
        action={
          <Link className="button secondary" href="/">
            All tenants
          </Link>
        }
      />
      <div className="workbench">
        <form
          className="panel claim-form"
          onSubmit={(event) => {
            event.preventDefault();
            void submit('preview');
          }}
        >
          <fieldset className="claim-inputs" disabled={submitting !== null}>
            <TenantPicker
              label="Insurance partner"
              value={tenant}
              onError={onError}
              onChange={(nextTenant) => {
                setTenant(nextTenant);
                setTenantId(nextTenant?.id ?? '');
                updateInput({ ...input, customFieldValues: {} });
              }}
            />
            <div className="field-row">
              <label>
                Claim type
                <Select
                  value={input.claimType}
                  onChange={(event) =>
                    updateInput({
                      ...input,
                      claimType: event.target.value as typeof input.claimType,
                    })
                  }
                >
                  {enabledClaimTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </Select>
              </label>
              <label>
                Amount (units)
                <input
                  type="number"
                  min="0"
                  max={Number.MAX_SAFE_INTEGER}
                  required
                  step="1"
                  value={Number.isNaN(input.amount) ? '' : input.amount}
                  onChange={(event) =>
                    updateInput({
                      ...input,
                      amount:
                        event.target.value === ''
                          ? Number.NaN
                          : Number(event.target.value),
                    })
                  }
                />
              </label>
            </div>
            <label>
              Submission date
              <input
                type="date"
                required
                value={input.submittedDate}
                onChange={(event) =>
                  updateInput({ ...input, submittedDate: event.target.value })
                }
              />
            </label>
            {tenant && (
              <ClaimCustomFields
                key={tenantId}
                fields={selectedConfig?.customFields ?? []}
                values={input.customFieldValues}
                onChange={(values) =>
                  updateInput({ ...input, customFieldValues: values })
                }
              />
            )}
          </fieldset>
          <div className="form-footer">
            <Button
              disabled={submitting !== null || !tenantId || !selectedConfig}
            >
              {submitting === 'preview' ? 'Previewing…' : 'Preview result'}
            </Button>
            <button
              type="button"
              className="button secondary"
              disabled={submitting !== null || !tenantId || !selectedConfig}
              onClick={() => void submit('process')}
            >
              {submitting === 'process'
                ? 'Mock processing…'
                : 'Process with mock sends'}
            </button>
          </div>
          <p className="hint">
            Preview never sends. Process logs each configured channel and its
            payload to the API log.
          </p>
        </form>
        <section className="result-column">
          {result ? (
            <ClaimResultCard result={result} />
          ) : (
            <div className="panel empty-result">
              <div className="result-icon">✳</div>
              <h2>Results appear here</h2>
              <p className="muted">
                Choose a tenant, enter a claim, and run the preview.
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
