import _ from 'lodash';
import { CLAIM_TYPES } from '@papaya/contracts';
import { Select } from '@/components/select';
import {
  APPROVER_ROLES,
  DEFAULT_SLA_BUSINESS_DAYS,
  TENANT_DOCUMENT_NAME_MAX_LENGTH,
} from '../constants';
import type { TenantConfigStepProps } from './tenant-editor.types';

function DocumentOptions({
  label,
  claimType,
  documents,
  readOnly,
  onChange,
}: {
  label: string;
  claimType: (typeof CLAIM_TYPES)[number];
  documents: string[];
  readOnly: boolean;
  onChange: (documents: string[]) => void;
}) {
  return (
    <div className="documents-editor">
      <span className="documents-label">{label}</span>
      {!documents.length && (
        <span className="muted documents-empty">No documents added.</span>
      )}
      {_.map(documents, (document, index) => (
        <div
          className="document-option-row"
          key={`${claimType}-${label}-${index}`}
        >
          <input
            required
            maxLength={TENANT_DOCUMENT_NAME_MAX_LENGTH}
            readOnly={readOnly}
            aria-label={`${claimType} ${label.toLowerCase()} ${index + 1}`}
            value={document}
            onChange={(event) =>
              onChange(
                _.map(documents, (item, itemIndex) =>
                  itemIndex === index ? event.target.value : item,
                ),
              )
            }
            onBlur={(event) => {
              const value = event.currentTarget.value.trim();
              if (value !== document)
                onChange(
                  _.map(documents, (item, itemIndex) =>
                    itemIndex === index ? value : item,
                  ),
                );
            }}
          />
          {!readOnly && (
            <button
              className="icon-action remove-action"
              type="button"
              aria-label={`Remove ${claimType} ${label.toLowerCase()} ${index + 1}`}
              onClick={() =>
                onChange(
                  _.filter(documents, (_, itemIndex) => itemIndex !== index),
                )
              }
            >
              ×
            </button>
          )}
        </div>
      ))}
      {!readOnly && (
        <button
          className="text-button align-start"
          type="button"
          onClick={() => onChange([...documents, ''])}
        >
          + Add document
        </button>
      )}
    </div>
  );
}

export function TenantClaimsStep({
  config,
  readOnly,
  updateConfig,
}: TenantConfigStepProps) {
  const enabledClaimTypeCount = _.filter(
    CLAIM_TYPES,
    (type) => config.claimTypes[type].enabled,
  ).length;

  return (
    <section className="config-section">
      <div className="section-heading">
        <div>
          <h2>Claim types & documents</h2>
          <p>Choose accepted claims and their required paperwork.</p>
        </div>
      </div>
      <div className="claim-config-list">
        {_.map(CLAIM_TYPES, (type) => {
          const claim = config.claimTypes[type];
          return (
            <div className="claim-config" key={type}>
              <label className="check-row">
                <input
                  type="checkbox"
                  disabled={
                    readOnly || (claim.enabled && enabledClaimTypeCount === 1)
                  }
                  checked={claim.enabled}
                  onChange={(event) =>
                    updateConfig((draft) => {
                      draft.claimTypes[type].enabled = event.target.checked;
                    })
                  }
                />{' '}
                <span className={`chip chip-${type.toLowerCase()}`}>
                  {type}
                </span>
              </label>
              {claim.enabled && (
                <div className="config-grid claim-config-fields">
                  <DocumentOptions
                    label="Required documents"
                    claimType={type}
                    documents={claim.requiredDocuments}
                    readOnly={readOnly}
                    onChange={(documents) =>
                      updateConfig((draft) => {
                        draft.claimTypes[type].requiredDocuments = documents;
                      })
                    }
                  />
                  <DocumentOptions
                    label="Optional documents"
                    claimType={type}
                    documents={claim.optionalDocuments}
                    readOnly={readOnly}
                    onChange={(documents) =>
                      updateConfig((draft) => {
                        draft.claimTypes[type].optionalDocuments = documents;
                      })
                    }
                  />
                  {claim.sla && (
                    <>
                      <label>
                        Processing time (business days)
                        <input
                          type="number"
                          min="1"
                          step="1"
                          required
                          readOnly={readOnly}
                          value={claim.sla.businessDays}
                          onChange={(event) =>
                            updateConfig((draft) => {
                              draft.claimTypes[type].sla!.businessDays = Number(
                                event.target.value,
                              );
                            })
                          }
                        />
                      </label>
                      <label>
                        Escalation role
                        <Select
                          required
                          disabled={readOnly}
                          value={claim.sla.escalationRole}
                          onChange={(event) =>
                            updateConfig((draft) => {
                              draft.claimTypes[type].sla!.escalationRole =
                                event.target.value;
                            })
                          }
                        >
                          <option value="">Select role</option>
                          {_.chain([
                            ...APPROVER_ROLES,
                            claim.sla.escalationRole,
                          ])
                            .uniq()
                            .filter(Boolean)
                            .map((role) => (
                              <option key={role} value={role}>
                                {_.startCase(role)}
                              </option>
                            ))
                            .value()}
                        </Select>
                      </label>
                    </>
                  )}
                  <button
                    className="sla-switch"
                    type="button"
                    role="switch"
                    aria-checked={Boolean(claim.sla)}
                    disabled={readOnly}
                    onClick={() =>
                      updateConfig((draft) => {
                        draft.claimTypes[type].sla = claim.sla
                          ? null
                          : {
                              businessDays: DEFAULT_SLA_BUSINESS_DAYS,
                              escalationRole: '',
                            };
                      })
                    }
                  >
                    <span className="switch-track" aria-hidden="true">
                      <span />
                    </span>
                    Configure SLA
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
