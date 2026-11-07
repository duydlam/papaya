import { BadRequestException } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import {
  CLAIM_TYPES,
  CUSTOM_FIELD_TEXT_MAX_LENGTH,
  DATE_ONLY_FORMAT,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_EVENTS,
  type ClaimType,
  type CustomFieldDefinition,
  type CustomFieldType,
  type TenantConfig,
} from '@papaya/contracts';
import type {
  CustomFieldValidator,
  CustomFieldValueValidator,
  StringListValidation,
  UnknownRecord,
} from './tenant-config.types';
const isRecord = (value: unknown): value is UnknownRecord =>
  _.isPlainObject(value);
const isValidDate = (value: unknown): value is string =>
  _.isString(value) && moment.utc(value, DATE_ONLY_FORMAT, true).isValid();
const errorIf = (condition: boolean, message: string) =>
  condition ? [message] : [];
const fail = (errors: string[]): never => {
  throw new BadRequestException({ message: errors });
};

const validateStringList = (
  value: unknown,
  label: string,
): StringListValidation => {
  const valid =
    _.isArray(value) &&
    _.every(value, (item) => _.isString(item) && !!_.trim(item));
  const values = valid ? (value as string[]) : [];

  return {
    valid,
    values,
    errors: valid
      ? errorIf(
          _.uniq(values).length !== values.length,
          `${label} must not contain duplicates`,
        )
      : [`${label} must be a list of non-empty strings`],
  };
};

const validateCustomFieldTypes: Record<string, CustomFieldValidator> = {
  text: (field, label) =>
    errorIf(
      !_.isInteger(field.maxLength) ||
        (field.maxLength as number) < 1 ||
        (field.maxLength as number) > CUSTOM_FIELD_TEXT_MAX_LENGTH,
      `${label}.maxLength must be between 1 and ${CUSTOM_FIELD_TEXT_MAX_LENGTH}`,
    ),
  number: (field, label) =>
    errorIf(
      (field.min !== undefined &&
        (!_.isNumber(field.min) || !_.isFinite(field.min))) ||
        (field.max !== undefined &&
          (!_.isNumber(field.max) || !_.isFinite(field.max))) ||
        (_.isNumber(field.min) &&
          _.isNumber(field.max) &&
          field.min > field.max),
      `${label} has invalid number bounds`,
    ),
  date: (field, label) =>
    errorIf(
      (field.minDate !== undefined && !isValidDate(field.minDate)) ||
        (field.maxDate !== undefined && !isValidDate(field.maxDate)) ||
        (isValidDate(field.minDate) &&
          isValidDate(field.maxDate) &&
          moment.utc(field.minDate).isAfter(moment.utc(field.maxDate))),
      `${label} has invalid date bounds`,
    ),
  boolean: () => [],
  select: (field, label) => {
    const options = field.options;
    const valid =
      _.isArray(options) &&
      options.length > 0 &&
      _.every(
        options,
        (option) =>
          isRecord(option) &&
          _.isString(option.value) &&
          !!option.value &&
          _.isString(option.label) &&
          !!_.trim(option.label),
      ) &&
      _.uniq(_.map(options, 'value')).length === options.length;

    return errorIf(
      !valid,
      `${label}.options must contain unique values and labels`,
    );
  },
};

const validateCustomField = (value: unknown, index: number): string[] => {
  const label = `customFields[${index}]`;
  if (!isRecord(value)) return [`${label} must be an object`];

  const validateType =
    validateCustomFieldTypes[_.toString(value.type)] ??
    (() => [`${label}.type is not supported`]);
  return _.concat(
    errorIf(
      !_.isString(value.key) || !/^[a-z][a-z0-9_]*$/.test(value.key),
      `${label}.key must be lowercase snake_case`,
    ),
    errorIf(
      !_.isString(value.label) || !_.trim(value.label),
      `${label}.label is required`,
    ),
    errorIf(
      !_.isBoolean(value.required),
      `${label}.required must be a boolean`,
    ),
    validateType(value, label),
  );
};

const validateBranding = (value: unknown): string[] => {
  if (!isRecord(value)) return ['branding must be an object'];

  return _.concat(
    errorIf(
      !_.isString(value.companyName) || !_.trim(value.companyName),
      'branding.companyName is required',
    ),
    errorIf(
      !_.isString(value.logoUrl) ||
        (!!value.logoUrl && !/^https?:\/\//i.test(value.logoUrl)),
      'branding.logoUrl must be empty or an HTTP(S) URL',
    ),
    _.flatMap(['primaryColor', 'secondaryColor'], (color) =>
      errorIf(
        !_.isString(value[color]) ||
          !/^#[0-9a-f]{6}$/i.test(value[color] as string),
        `branding.${color} must be a six-digit hex color`,
      ),
    ),
  );
};

const validateSla = (value: unknown, claimType: string): string[] =>
  value === null ||
  (isRecord(value) &&
    _.isSafeInteger(value.businessDays) &&
    (value.businessDays as number) > 0 &&
    _.isString(value.escalationRole) &&
    !!_.trim(value.escalationRole))
    ? []
    : [
        `claimTypes.${claimType}.sla must have positive days and an escalation role`,
      ];

const validateClaimType = ([key, value]: [string, unknown]): string[] => {
  if (!CLAIM_TYPES.includes(key as ClaimType))
    return [`claimTypes.${key} is not supported`];
  if (!isRecord(value)) return [`claimTypes.${key}.enabled must be a boolean`];

  const required = validateStringList(
    value.requiredDocuments,
    `claimTypes.${key}.requiredDocuments`,
  );
  const optional = validateStringList(
    value.optionalDocuments,
    `claimTypes.${key}.optionalDocuments`,
  );
  return _.concat(
    errorIf(
      !_.isBoolean(value.enabled),
      `claimTypes.${key}.enabled must be a boolean`,
    ),
    required.errors,
    optional.errors,
    errorIf(
      required.valid &&
        optional.valid &&
        _.some(required.values, (item) => _.includes(optional.values, item)),
      `claimTypes.${key} documents cannot be both required and optional`,
    ),
    validateSla(value.sla, key),
  );
};

const validateApprovalBand = (
  bands: unknown[],
  threshold: unknown,
  band: unknown,
  index: number,
): string[] => {
  if (!isRecord(band)) {
    return [`approval.bands[${index}] is invalid or leaves a gap/overlap`];
  }

  const previous = bands[index - 1];
  const expectedMin =
    index === 0
      ? threshold
      : isRecord(previous) && _.isSafeInteger(previous.maxAmount)
        ? (previous.maxAmount as number) + 1
        : Number.NaN;
  const valid =
    _.isSafeInteger(band.minAmount) &&
    band.minAmount === expectedMin &&
    (band.maxAmount === null ||
      (_.isSafeInteger(band.maxAmount) &&
        (band.maxAmount as number) >= (band.minAmount as number))) &&
    _.isString(band.role) &&
    !!_.trim(band.role);

  return _.concat(
    errorIf(
      !valid,
      `approval.bands[${index}] is invalid or leaves a gap/overlap`,
    ),
    errorIf(
      band.maxAmount === null && index !== bands.length - 1,
      'Only the final approval band may have no upper bound',
    ),
  );
};

const validateApproval = (value: unknown): string[] => {
  if (!isRecord(value)) return ['approval must be an object'];

  const threshold = value.autoApprovalThreshold;
  const bands = value.bands;
  const errors = errorIf(
    !_.isSafeInteger(threshold) || (threshold as number) < 0,
    'approval.autoApprovalThreshold must be a non-negative integer',
  );
  if (!_.isArray(bands) || !bands.length) {
    return _.concat(errors, 'approval.bands must contain at least one range');
  }

  return _.concat(
    errors,
    _.flatMap(bands, (band, index) =>
      validateApprovalBand(bands, threshold, band, index),
    ),
    errorIf(
      !isRecord(_.last(bands)) || _.last(bands)?.maxAmount !== null,
      'The final approval band must have no upper bound',
    ),
  );
};

const validateNotification = (
  notifications: UnknownRecord,
  event: string,
): string[] => {
  const rule = notifications[event];
  if (!isRecord(rule))
    return [`notifications.${event}.channels must be a list`];

  return _.concat(
    errorIf(
      !_.isArray(rule.channels) ||
        _.some(
          rule.channels,
          (channel) =>
            !_.isString(channel) ||
            !NOTIFICATION_CHANNELS.includes(channel as never),
        ) ||
        (_.isArray(rule.channels) &&
          _.uniq(rule.channels).length !== rule.channels.length),
      `notifications.${event}.channels contains an invalid channel`,
    ),
    errorIf(
      rule.emailTemplate !== null && !_.isString(rule.emailTemplate),
      `notifications.${event}.emailTemplate must be text or null`,
    ),
  );
};

const validateClaimTypes = (value: unknown): string[] => {
  if (!isRecord(value)) return ['claimTypes must be an object'];

  return _.concat(
    _.flatMap(_.toPairs(value), validateClaimType),
    errorIf(
      !_.some(
        _.values(value),
        (claimType) => isRecord(claimType) && claimType.enabled === true,
      ),
      'At least one claim type must be enabled',
    ),
    _.map(
      _.difference(CLAIM_TYPES, _.keys(value)),
      (claimType) => `claimTypes.${claimType} configuration is required`,
    ),
  );
};

const validateNotifications = (value: unknown): string[] =>
  isRecord(value)
    ? _.flatMap(NOTIFICATION_EVENTS, (event) =>
        validateNotification(value, event),
      )
    : ['notifications must be an object'];

const validateCustomFields = (value: unknown): string[] => {
  if (!_.isArray(value)) return ['customFields must be a list'];

  const records = _.filter(value, isRecord);
  return _.concat(
    _.flatMap(value, validateCustomField),
    errorIf(
      _.uniq(_.map(records, (field) => field.key)).length !== records.length,
      'customFields keys must be unique',
    ),
  );
};

const validateCustomFieldValue: Record<
  CustomFieldType,
  CustomFieldValueValidator
> = {
  text: (value, field) =>
    _.isString(value) &&
    !!_.trim(value) &&
    _.trim(value).length <= (field.maxLength ?? CUSTOM_FIELD_TEXT_MAX_LENGTH),
  number: (value, field) =>
    _.isNumber(value) &&
    _.isFinite(value) &&
    (field.min === undefined || (value as number) >= field.min) &&
    (field.max === undefined || (value as number) <= field.max),
  date: (value, field) =>
    isValidDate(value) &&
    (field.minDate === undefined ||
      moment.utc(value).isSameOrAfter(moment.utc(field.minDate), 'day')) &&
    (field.maxDate === undefined ||
      moment.utc(value).isSameOrBefore(moment.utc(field.maxDate), 'day')),
  boolean: _.isBoolean,
  select: (value, field) =>
    _.isString(value) && _.some(field.options, { value }),
};

export const validateTenantConfig: (
  value: unknown,
) => asserts value is TenantConfig = (value) => {
  const config = isRecord(value) ? value : fail(['config must be an object']);
  const errors = _.concat(
    validateBranding(config.branding),
    validateClaimTypes(config.claimTypes),
    validateApproval(config.approval),
    validateNotifications(config.notifications),
    validateCustomFields(config.customFields),
  );

  if (errors.length) fail(errors);
};

export const validateClaimFieldValues: (
  definitions: CustomFieldDefinition[],
  values: unknown,
) => asserts values is Record<string, string | number | boolean> = (
  definitions,
  values,
) => {
  const fieldValues = isRecord(values)
    ? values
    : fail(['customFieldValues must be an object']);

  const unknownFields = _.difference(
    _.keys(fieldValues),
    _.map(definitions, 'key'),
  );
  const errors = _.concat(
    errorIf(
      !_.isEmpty(unknownFields),
      `Unknown custom fields: ${_.join(unknownFields, ', ')}`,
    ),
    _.flatMap(definitions, (field) => {
      const value = fieldValues[field.key];
      const empty = _.isNil(value) || value === '';
      return empty
        ? errorIf(field.required, `${field.label} is required`)
        : errorIf(
            !validateCustomFieldValue[field.type](value, field),
            `${field.label} has an invalid value`,
          );
    }),
  );

  if (errors.length) fail(errors);
};
