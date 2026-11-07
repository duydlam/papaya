export const DATE_ONLY_FORMAT: 'YYYY-MM-DD';
export const CUSTOM_FIELD_TEXT_MAX_LENGTH: 255;
export const CLAIM_TYPES: readonly [
  'OUTPATIENT',
  'INPATIENT',
  'DENTAL',
  'MATERNITY',
  'OPTICAL',
];
export type ClaimType = (typeof CLAIM_TYPES)[number];

export const NOTIFICATION_EVENTS: readonly [
  'claim_submitted',
  'approved',
  'rejected',
  'payment_sent',
];
export type NotificationEvent = (typeof NOTIFICATION_EVENTS)[number];

export const NOTIFICATION_CHANNELS: readonly ['email', 'sms', 'webhook'];
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];
export type CustomFieldType = 'text' | 'number' | 'date' | 'boolean' | 'select';
export type CustomFieldValue = string | number | boolean;

export interface BrandingConfig {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface CustomFieldDefinition {
  key: string;
  label: string;
  type: CustomFieldType;
  required: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  minDate?: string;
  maxDate?: string;
  options?: { value: string; label: string }[];
}

export interface TenantConfig {
  branding: BrandingConfig;
  claimTypes: Record<ClaimType, ClaimTypeConfig>;
  approval: {
    autoApprovalThreshold: number;
    bands: { minAmount: number; maxAmount: number | null; role: string }[];
  };
  notifications: Record<
    NotificationEvent,
    { channels: NotificationChannel[]; emailTemplate: string | null }
  >;
  customFields: CustomFieldDefinition[];
}

export interface ClaimTypeConfig {
  enabled: boolean;
  requiredDocuments: string[];
  optionalDocuments: string[];
  sla: { businessDays: number; escalationRole: string } | null;
}

export interface TenantSummary {
  id: string;
  status: 'active' | 'archived';
  currentVersion: number;
  companyName: string;
  enabledClaimTypes: ClaimType[];
}

export interface TenantDetails extends TenantSummary {
  config: TenantConfig;
}

export interface TenantPage {
  items: TenantSummary[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ConfigVersionSummary {
  version: number;
  createdAt: string;
  restoredFromVersion: number | null;
}

export interface TenantConfigVersion extends ConfigVersionSummary {
  config: TenantConfig;
}

export interface ClaimPreviewInput {
  tenantId: string;
  claimType: ClaimType;
  amount: number;
  submittedDate: string;
  customFieldValues: Record<string, CustomFieldValue>;
}

export interface ClaimProcessingResult {
  tenantId: string;
  configVersion: number;
  claimType: ClaimType;
  amount: number;
  submittedDate: string;
  approval: {
    status: 'auto_approved' | 'pending_approval';
    approverRole: string | null;
    autoApprovalThreshold: number;
  };
  documents: { required: string[]; optional: string[] };
  notifications: {
    event: NotificationEvent;
    channels: NotificationChannel[];
    emailTemplate: string | null;
  }[];
  sla: {
    businessDays: number;
    deadline: string;
    escalationRole: string;
  } | null;
  customFields: CustomFieldDefinition[];
  customFieldValues: Record<string, CustomFieldValue>;
}

export interface MockDelivery {
  event: NotificationEvent;
  channel: NotificationChannel;
  status: 'mocked';
  payload: {
    tenantId: string;
    event: NotificationEvent;
    channel: NotificationChannel;
    claimType: ClaimType;
    amount: number;
    submittedDate: string;
    customFieldValues: Record<string, CustomFieldValue>;
    emailTemplate?: string;
  };
}

export interface ClaimProcessResult extends ClaimProcessingResult {
  mockDeliveries: MockDelivery[];
}

export interface ConfigDiffEntry {
  path: string;
  left: unknown;
  right: unknown;
}

export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  timestamp: string;
}
