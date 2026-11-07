export const TENANT_PAGE_SIZE = 10;
export const TENANT_HISTORY_DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm';
export const TENANT_COMPANY_NAME_MAX_LENGTH = 120;
export const TENANT_DOCUMENT_NAME_MAX_LENGTH = 120;
export const TENANT_CUSTOM_FIELD_KEY_MAX_LENGTH = 80;
export const DEFAULT_SLA_BUSINESS_DAYS = 5;
export const DEFAULT_NEW_TENANT_NAME = 'New Insurance Partner';

export const APPROVER_ROLES = [
  'assessor',
  'team_lead',
  'manager',
  'director',
  'committee',
] as const;

export const TENANT_CONFIG_STEPS = [
  'Branding',
  'Claims & documents',
  'Approval rules',
  'Notifications',
  'Custom fields',
] as const;
