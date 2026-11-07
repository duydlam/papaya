import _ from 'lodash';
import type { ClaimPreviewInput, TenantConfig } from '@papaya/contracts';
import { Select } from '@/components/select';
import { getCustomFieldInputProps } from '../utils/custom-field-input.utils';

export function ClaimCustomFields({
  fields,
  values,
  onChange,
}: {
  fields: TenantConfig['customFields'];
  values: ClaimPreviewInput['customFieldValues'];
  onChange: (values: ClaimPreviewInput['customFieldValues']) => void;
}) {
  if (!fields.length) return null;

  return (
    <div className="custom-fields">
      <h3>Additional claim details</h3>
      {_.map(fields, (field) => (
        <label key={field.key}>
          {field.label}
          {field.type === 'select' ? (
            <Select
              required={field.required}
              value={String(values[field.key] ?? '')}
              onChange={(event) =>
                onChange({ ...values, [field.key]: event.target.value })
              }
            >
              <option value="">Select…</option>
              {_.map(field.options, (option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          ) : field.type === 'boolean' ? (
            <Select
              required={field.required}
              value={String(values[field.key] ?? '')}
              onChange={(event) =>
                onChange({
                  ...values,
                  [field.key]:
                    event.target.value === ''
                      ? ''
                      : event.target.value === 'true',
                })
              }
            >
              <option value="">Select…</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          ) : (
            <input
              required={field.required}
              {...getCustomFieldInputProps(field)}
              value={String(values[field.key] ?? '')}
              onChange={(event) =>
                onChange({
                  ...values,
                  [field.key]:
                    field.type === 'number' && event.target.value
                      ? Number(event.target.value)
                      : event.target.value,
                })
              }
            />
          )}
        </label>
      ))}
    </div>
  );
}
