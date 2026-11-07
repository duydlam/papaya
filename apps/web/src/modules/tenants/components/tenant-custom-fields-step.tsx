import _ from 'lodash';
import { CUSTOM_FIELD_TEXT_MAX_LENGTH } from '@papaya/contracts';
import type { TenantConfigStepProps } from './tenant-editor.types';
import { TenantCustomFieldEditor } from './tenant-custom-field-editor';

export function TenantCustomFieldsStep({
  config,
  readOnly,
  updateConfig,
}: TenantConfigStepProps) {
  return (
    <section className="config-section">
      <div className="section-heading">
        <div>
          <h2>Custom fields</h2>
          <p>Additional information requested with each claim.</p>
        </div>
      </div>
      {_.map(config.customFields, (field, index) => (
        <TenantCustomFieldEditor
          key={`${field.key}-${index}`}
          field={field}
          index={index}
          readOnly={readOnly}
          updateConfig={updateConfig}
        />
      ))}
      {!readOnly && (
        <button
          className="text-button align-start"
          type="button"
          onClick={() =>
            updateConfig((draft) => {
              draft.customFields.push({
                key: '',
                label: '',
                type: 'text',
                required: false,
                maxLength: CUSTOM_FIELD_TEXT_MAX_LENGTH,
              });
            })
          }
        >
          + Add custom field
        </button>
      )}
    </section>
  );
}
