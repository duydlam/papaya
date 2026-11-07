import {
  CUSTOM_FIELD_TEXT_MAX_LENGTH,
  type CustomFieldDefinition,
} from '@papaya/contracts';
import { Select } from '@/components/select';
import { TENANT_CUSTOM_FIELD_KEY_MAX_LENGTH } from '../constants';
import type { TenantConfigUpdate } from './tenant-editor.types';
import { TenantCustomFieldSettings } from './tenant-custom-field-settings';

export function TenantCustomFieldEditor({
  field,
  index,
  readOnly,
  updateConfig,
}: {
  field: CustomFieldDefinition;
  index: number;
  readOnly: boolean;
  updateConfig: TenantConfigUpdate;
}) {
  return (
    <div className="custom-field-card">
      <div className="custom-config-row">
        <label>
          Field label
          <input
            required
            readOnly={readOnly}
            value={field.label}
            onChange={(event) =>
              updateConfig((draft) => {
                draft.customFields[index].label = event.target.value;
              })
            }
          />
        </label>
        <label>
          Key
          <input
            required
            maxLength={TENANT_CUSTOM_FIELD_KEY_MAX_LENGTH}
            pattern="[a-z][a-z0-9_]*"
            title="Use lowercase letters, numbers, and underscores; start with a letter."
            readOnly={readOnly}
            value={field.key}
            onChange={(event) =>
              updateConfig((draft) => {
                draft.customFields[index].key = event.target.value;
              })
            }
          />
        </label>
        <label>
          Type
          <Select
            disabled={readOnly}
            value={field.type}
            onChange={(event) =>
              updateConfig((draft) => {
                const current = draft.customFields[index];
                current.type = event.target.value as typeof field.type;
                delete current.min;
                delete current.max;
                delete current.maxLength;
                delete current.minDate;
                delete current.maxDate;
                delete current.options;
                if (current.type === 'text')
                  current.maxLength = CUSTOM_FIELD_TEXT_MAX_LENGTH;
                if (current.type === 'select')
                  current.options = [{ value: '', label: '' }];
              })
            }
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="boolean">Yes / no</option>
            <option value="select">Select</option>
          </Select>
        </label>
        <button
          className="sla-switch required-switch"
          type="button"
          role="switch"
          aria-checked={field.required}
          disabled={readOnly}
          onClick={() =>
            updateConfig((draft) => {
              draft.customFields[index].required = !field.required;
            })
          }
        >
          <span className="switch-track" aria-hidden="true">
            <span />
          </span>
          Required
        </button>
        {!readOnly && (
          <button
            className="icon-action remove-action"
            type="button"
            aria-label={`Remove ${field.label}`}
            onClick={() =>
              updateConfig((draft) => {
                draft.customFields.splice(index, 1);
              })
            }
          >
            ×
          </button>
        )}
      </div>
      {field.type !== 'boolean' && (
        <TenantCustomFieldSettings
          field={field}
          index={index}
          readOnly={readOnly}
          updateConfig={updateConfig}
        />
      )}
    </div>
  );
}
