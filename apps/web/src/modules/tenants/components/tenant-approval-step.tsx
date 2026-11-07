import _ from 'lodash';
import { Select } from '@/components/select';
import { APPROVER_ROLES } from '../constants';
import type { TenantConfigStepProps } from './tenant-editor.types';

const approverRoles = (role: string) =>
  _.chain([...APPROVER_ROLES, role])
    .uniq()
    .filter(Boolean)
    .value();

const updateThreshold = (
  updateConfig: TenantConfigStepProps['updateConfig'],
  value: string,
) =>
  updateConfig((draft) => {
    draft.approval.autoApprovalThreshold = Number(value);
  });

const updateBandMinimum = (
  updateConfig: TenantConfigStepProps['updateConfig'],
  index: number,
  value: string,
) =>
  updateConfig((draft) => {
    draft.approval.bands[index].minAmount = Number(value);
  });

const updateBandMaximum = (
  updateConfig: TenantConfigStepProps['updateConfig'],
  index: number,
  value: string,
) =>
  updateConfig((draft) => {
    draft.approval.bands[index].maxAmount = value === '' ? null : Number(value);
  });

const updateBandRole = (
  updateConfig: TenantConfigStepProps['updateConfig'],
  index: number,
  role: string,
) =>
  updateConfig((draft) => {
    draft.approval.bands[index].role = role;
  });

const removeApprovalBand = (
  updateConfig: TenantConfigStepProps['updateConfig'],
  index: number,
) =>
  updateConfig((draft) => {
    draft.approval.bands.splice(index, 1);
  });

const addApprovalBand = (updateConfig: TenantConfigStepProps['updateConfig']) =>
  updateConfig((draft) => {
    const previous = _.last(draft.approval.bands);
    const minAmount = previous
      ? (previous.maxAmount ?? previous.minAmount) + 1
      : draft.approval.autoApprovalThreshold + 1;
    if (previous) previous.maxAmount = minAmount - 1;
    draft.approval.bands.push({ minAmount, maxAmount: null, role: '' });
  });

export function TenantApprovalStep({
  config,
  readOnly,
  updateConfig,
}: TenantConfigStepProps) {
  return (
    <section className="config-section">
      <div className="section-heading">
        <div>
          <h2>Approval rules</h2>
          <p>Set the auto-approval limit and routing bands.</p>
        </div>
      </div>
      <label className="narrow-field">
        Auto-approval threshold
        <input
          type="number"
          min="0"
          step="1"
          required
          readOnly={readOnly}
          value={config.approval.autoApprovalThreshold}
          onChange={(event) =>
            updateThreshold(updateConfig, event.target.value)
          }
        />
      </label>
      <div className="band-list">
        {_.map(config.approval.bands, (band, index) => (
          <div className="band-row" key={`${index}-${band.role}`}>
            <label>
              From
              <input
                aria-label={`Band ${index + 1} minimum amount`}
                type="number"
                min="0"
                step="1"
                required
                readOnly={readOnly}
                value={band.minAmount}
                onChange={(event) =>
                  updateBandMinimum(updateConfig, index, event.target.value)
                }
              />
            </label>
            <label>
              To
              <input
                aria-label={`Band ${index + 1} maximum amount`}
                type="number"
                min="0"
                step="1"
                required={index < config.approval.bands.length - 1}
                readOnly={readOnly}
                placeholder={band.maxAmount === null ? 'No limit' : undefined}
                value={band.maxAmount ?? ''}
                onChange={(event) =>
                  updateBandMaximum(updateConfig, index, event.target.value)
                }
              />
            </label>
            <label>
              Approver role
              <Select
                required
                disabled={readOnly}
                value={band.role}
                onChange={(event) =>
                  updateBandRole(updateConfig, index, event.target.value)
                }
              >
                <option value="">Select role</option>
                {_.map(approverRoles(band.role), (role) => (
                  <option key={role} value={role}>
                    {_.startCase(role)}
                  </option>
                ))}
              </Select>
            </label>
            {!readOnly && (
              <button
                className="icon-action remove-action"
                type="button"
                aria-label={`Remove approval band ${index + 1}`}
                onClick={() => removeApprovalBand(updateConfig, index)}
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
            onClick={() => addApprovalBand(updateConfig)}
          >
            + Add approval band
          </button>
        )}
      </div>
    </section>
  );
}
