import {
  CUSTOM_FIELD_TEXT_MAX_LENGTH,
  type CustomFieldDefinition,
} from '@papaya/contracts';
import type { InputHTMLAttributes } from 'react';

type InputProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'maxLength' | 'min' | 'max' | 'step' | 'type'
>;

export const getCustomFieldInputProps = (
  field: CustomFieldDefinition,
): InputProps =>
  ({
    text: {
      type: 'text',
      maxLength: field.maxLength ?? CUSTOM_FIELD_TEXT_MAX_LENGTH,
    },
    number: { type: 'number', min: field.min, max: field.max, step: 'any' },
    date: { type: 'date', min: field.minDate, max: field.maxDate },
    boolean: { type: 'text' },
    select: { type: 'text' },
  })[field.type];
