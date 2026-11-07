import type { CustomFieldDefinition } from '@papaya/contracts';

type UnknownRecord = Record<string, unknown>;

type StringListValidation = {
  valid: boolean;
  values: string[];
  errors: string[];
};

type CustomFieldValidator = (field: UnknownRecord, label: string) => string[];
type CustomFieldValueValidator = (
  value: unknown,
  field: CustomFieldDefinition,
) => boolean;

export type {
  CustomFieldValidator,
  CustomFieldValueValidator,
  StringListValidation,
  UnknownRecord,
};
