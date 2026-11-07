import _ from 'lodash';
import {
  CUSTOM_FIELD_TEXT_MAX_LENGTH,
  type CustomFieldDefinition,
} from '@papaya/contracts';
import type { TenantConfigUpdate } from './tenant-editor.types';

export function TenantCustomFieldSettings({
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
    <div className="custom-field-settings">
      {field.type === 'text' && (
        <div className="field-constraint-row">
          <label>
            Maximum characters
            <input
              type="number"
              min="1"
              max={CUSTOM_FIELD_TEXT_MAX_LENGTH}
              required
              readOnly={readOnly}
              value={field.maxLength ?? ''}
              onChange={(event) =>
                updateConfig((draft) => {
                  draft.customFields[index].maxLength = event.target.value
                    ? Number(event.target.value)
                    : undefined;
                })
              }
            />
          </label>
          <p>Allow between 1 and {CUSTOM_FIELD_TEXT_MAX_LENGTH} characters.</p>
        </div>
      )}
      {field.type === 'number' && (
        <div className="config-grid">
          <label>
            Minimum value
            <input
              type="number"
              readOnly={readOnly}
              value={field.min ?? ''}
              onChange={(event) =>
                updateConfig((draft) => {
                  draft.customFields[index].min = event.target.value
                    ? Number(event.target.value)
                    : undefined;
                })
              }
            />
          </label>
          <label>
            Maximum value
            <input
              type="number"
              readOnly={readOnly}
              value={field.max ?? ''}
              onChange={(event) =>
                updateConfig((draft) => {
                  draft.customFields[index].max = event.target.value
                    ? Number(event.target.value)
                    : undefined;
                })
              }
            />
          </label>
        </div>
      )}
      {field.type === 'date' && (
        <div className="config-grid">
          <label>
            Earliest date
            <input
              type="date"
              disabled={readOnly}
              value={field.minDate ?? ''}
              onChange={(event) =>
                updateConfig((draft) => {
                  draft.customFields[index].minDate =
                    event.target.value || undefined;
                })
              }
            />
          </label>
          <label>
            Latest date
            <input
              type="date"
              disabled={readOnly}
              value={field.maxDate ?? ''}
              onChange={(event) =>
                updateConfig((draft) => {
                  draft.customFields[index].maxDate =
                    event.target.value || undefined;
                })
              }
            />
          </label>
        </div>
      )}
      {field.type === 'select' && (
        <SelectFieldOptions
          options={field.options ?? []}
          index={index}
          readOnly={readOnly}
          updateConfig={updateConfig}
        />
      )}
    </div>
  );
}

function SelectFieldOptions({
  options,
  index,
  readOnly,
  updateConfig,
}: {
  options: NonNullable<CustomFieldDefinition['options']>;
  index: number;
  readOnly: boolean;
  updateConfig: TenantConfigUpdate;
}) {
  return (
    <div className="field-options">
      {_.map(options, (option, optionIndex) => (
        <div className="band-row option-row" key={optionIndex}>
          <label>
            Value
            <input
              required
              readOnly={readOnly}
              value={option.value}
              onChange={(event) =>
                updateConfig((draft) => {
                  draft.customFields[index].options![optionIndex].value =
                    event.target.value;
                })
              }
            />
          </label>
          <label>
            Label
            <input
              required
              readOnly={readOnly}
              value={option.label}
              onChange={(event) =>
                updateConfig((draft) => {
                  draft.customFields[index].options![optionIndex].label =
                    event.target.value;
                })
              }
            />
          </label>
          {!readOnly && (
            <button
              className="icon-action remove-action"
              type="button"
              aria-label={`Remove option ${option.label}`}
              onClick={() =>
                updateConfig((draft) => {
                  draft.customFields[index].options!.splice(optionIndex, 1);
                })
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
          onClick={() =>
            updateConfig((draft) => {
              draft.customFields[index].options = [
                ...(draft.customFields[index].options ?? []),
                { value: '', label: '' },
              ];
            })
          }
        >
          + Add option
        </button>
      )}
    </div>
  );
}
