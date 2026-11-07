'use client';

import { useState, type FormEvent } from 'react';
import _ from 'lodash';
import Link from 'next/link';
import { Button, PageTitle } from '@/components/portal-ui';
import { TENANT_CONFIG_STEPS } from '../constants';
import { useTenantEditor } from '../hooks/use-tenant-editor';
import { TenantApprovalStep } from './tenant-approval-step';
import { TenantBrandingStep } from './tenant-branding-step';
import { TenantClaimsStep } from './tenant-claims-step';
import { TenantCustomFieldsStep } from './tenant-custom-fields-step';
import type { TenantConfigUpdate } from './tenant-editor.types';
import { TenantNotificationsStep } from './tenant-notifications-step';

export function TenantEditor({
  tenantId,
  sampleTenantId,
  onError,
}: {
  tenantId?: string;
  sampleTenantId?: string;
  onError: (error: unknown) => void;
}) {
  const {
    detail,
    companyName,
    setCompanyName,
    config,
    setConfig,
    saving,
    readOnlyVersion,
    save,
    populateTemplate,
  } = useTenantEditor(tenantId, sampleTenantId, onError);
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const readOnly = Boolean(readOnlyVersion);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (step < TENANT_CONFIG_STEPS.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      setFurthestStep(Math.max(furthestStep, nextStep));
      return;
    }
    await save(companyName, config);
  };

  const updateConfig: TenantConfigUpdate = (update) =>
    setConfig((current) => {
      if (!current) return current;
      const draft = _.cloneDeep(current);
      update(draft);
      return draft;
    });

  return (
    <>
      <Link
        className="button secondary editor-back"
        href={
          tenantId && readOnlyVersion ? `/tenants/${tenantId}/history` : '/'
        }
      >
        ← Back
      </Link>
      <PageTitle
        eyebrow={tenantId ? 'TENANT CONFIGURATION' : 'ONBOARDING'}
        title={tenantId ? companyName || 'Loading tenant…' : 'Add a tenant'}
        description={
          tenantId
            ? readOnlyVersion
              ? `Read-only snapshot · version ${readOnlyVersion}.`
              : `Edit rules and version the configuration${detail ? ` · current version ${detail.currentVersion}` : ''}.`
            : 'Start from an existing configuration and tailor it for a new partner.'
        }
      />
      <form className="panel editor" onSubmit={submit}>
        {!tenantId && !config && (
          <div className="config-start">
            <p>
              Start with a sample insurer configuration, then edit its rules
              below.
            </p>
            <button
              className="button secondary"
              type="button"
              onClick={() => void populateTemplate()}
            >
              Use sample configuration
            </button>
          </div>
        )}
        {config && (
          <>
            <nav className="config-stepper" aria-label="Configuration steps">
              <div className="stepper-list">
                {_.map(TENANT_CONFIG_STEPS, (title, index) => (
                  <button
                    key={title}
                    className={`stepper-step${step === index ? ' active' : ''}${step > index ? ' complete' : ''}`}
                    type="button"
                    aria-current={step === index ? 'step' : undefined}
                    aria-label={`${index + 1}. ${title}${step > index ? ', completed' : ''}`}
                    disabled={!readOnly && index > furthestStep}
                    onClick={() => setStep(index)}
                  >
                    <span className="step-number">
                      {step > index ? '✓' : index + 1}
                    </span>
                    <span className="step-label">{title}</span>
                  </button>
                ))}
              </div>
              <span className="step-count">
                Step {step + 1} of {TENANT_CONFIG_STEPS.length}
              </span>
            </nav>
            <div className="config-sections">
              {step === 0 && (
                <TenantBrandingStep
                  config={config}
                  tenantId={tenantId}
                  companyName={companyName}
                  setCompanyName={setCompanyName}
                  readOnly={readOnly}
                  updateConfig={updateConfig}
                />
              )}
              {step === 1 && (
                <TenantClaimsStep
                  config={config}
                  readOnly={readOnly}
                  updateConfig={updateConfig}
                />
              )}
              {step === 2 && (
                <TenantApprovalStep
                  config={config}
                  readOnly={readOnly}
                  updateConfig={updateConfig}
                />
              )}
              {step === 3 && (
                <TenantNotificationsStep
                  config={config}
                  readOnly={readOnly}
                  updateConfig={updateConfig}
                />
              )}
              {step === 4 && (
                <TenantCustomFieldsStep
                  config={config}
                  readOnly={readOnly}
                  updateConfig={updateConfig}
                />
              )}
            </div>
          </>
        )}
        <p className="hint">
          Changes are validated by the API. Each save creates an immutable
          version.
        </p>
        <div className="form-footer">
          <Link
            className="button secondary"
            href={tenantId ? `/claims?tenant=${tenantId}` : '/claims'}
          >
            Preview a claim
          </Link>
          <div className="step-actions">
            {step > 0 && (
              <button
                className="button secondary"
                type="button"
                onClick={() => setStep(step - 1)}
              >
                Previous
              </button>
            )}
            {step < TENANT_CONFIG_STEPS.length - 1 ? (
              <Button disabled={!config}>Continue</Button>
            ) : !readOnlyVersion ? (
              <Button disabled={saving || !config}>
                {saving
                  ? 'Saving…'
                  : tenantId
                    ? 'Save new version'
                    : 'Create tenant'}
              </Button>
            ) : null}
          </div>
        </div>
      </form>
    </>
  );
}
