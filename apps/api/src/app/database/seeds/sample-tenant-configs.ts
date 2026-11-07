import {
  CLAIM_TYPES,
  NOTIFICATION_EVENTS,
  type TenantConfig,
} from '@papaya/contracts';

const notifications = (
  channelByEvent: Record<
    string,
    TenantConfig['notifications']['claim_submitted']['channels']
  >,
): TenantConfig['notifications'] =>
  Object.fromEntries(
    NOTIFICATION_EVENTS.map((event) => [
      event,
      { channels: channelByEvent[event] ?? [], emailTemplate: null },
    ]),
  ) as TenantConfig['notifications'];

const claimTypes = (
  enabled: Partial<
    Record<
      (typeof CLAIM_TYPES)[number],
      TenantConfig['claimTypes'][keyof TenantConfig['claimTypes']]
    >
  >,
): TenantConfig['claimTypes'] =>
  Object.fromEntries(
    CLAIM_TYPES.map((claimType) => [
      claimType,
      enabled[claimType] ?? {
        enabled: false,
        requiredDocuments: [],
        optionalDocuments: [],
        sla: null,
      },
    ]),
  ) as TenantConfig['claimTypes'];

export const sampleTenantConfigs: { name: string; config: TenantConfig }[] = [
  {
    name: 'SafeGuard Insurance',
    config: {
      branding: {
        companyName: 'SafeGuard Insurance',
        logoUrl: '',
        primaryColor: '#1E5A45',
        secondaryColor: '#DDEBE4',
      },
      claimTypes: claimTypes({
        OUTPATIENT: {
          enabled: true,
          requiredDocuments: ['Claim form', 'Itemized receipt'],
          optionalDocuments: ['Physician note'],
          sla: { businessDays: 5, escalationRole: 'team_lead' },
        },
        INPATIENT: {
          enabled: true,
          requiredDocuments: [
            'Claim form',
            'Hospital bill',
            'Discharge summary',
          ],
          optionalDocuments: ['Admission record'],
          sla: { businessDays: 10, escalationRole: 'team_lead' },
        },
        DENTAL: {
          enabled: true,
          requiredDocuments: ['Claim form', 'Itemized dental invoice'],
          optionalDocuments: ['Treatment plan'],
          sla: null,
        },
      }),
      approval: {
        autoApprovalThreshold: 20_000,
        bands: [
          { minAmount: 20_000, maxAmount: 100_000, role: 'assessor' },
          { minAmount: 100_001, maxAmount: 500_000, role: 'team_lead' },
          { minAmount: 500_001, maxAmount: null, role: 'director' },
        ],
      },
      notifications: notifications({
        claim_submitted: ['email'],
        approved: ['email'],
        rejected: ['email'],
        payment_sent: ['email'],
      }),
      customFields: [
        {
          key: 'employee_id',
          label: 'Employee ID',
          type: 'text',
          required: true,
          maxLength: 255,
        },
      ],
    },
  },
  {
    name: 'HealthFirst',
    config: {
      branding: {
        companyName: 'HealthFirst',
        logoUrl: '',
        primaryColor: '#3157A4',
        secondaryColor: '#E5EBF8',
      },
      claimTypes: claimTypes({
        OUTPATIENT: {
          enabled: true,
          requiredDocuments: ['Claim form', 'Itemized receipt'],
          optionalDocuments: ['Clinical note'],
          sla: { businessDays: 7, escalationRole: 'manager' },
        },
        INPATIENT: {
          enabled: true,
          requiredDocuments: [
            'Claim form',
            'Hospital bill',
            'Discharge summary',
          ],
          optionalDocuments: ['Treating physician report'],
          sla: { businessDays: 7, escalationRole: 'manager' },
        },
        DENTAL: {
          enabled: true,
          requiredDocuments: ['Claim form', 'Dental invoice', 'Treatment plan'],
          optionalDocuments: ['Dental X-ray'],
          sla: { businessDays: 7, escalationRole: 'manager' },
        },
        MATERNITY: {
          enabled: true,
          requiredDocuments: [
            'Claim form',
            'Maternity invoice',
            'Birth/delivery record',
          ],
          optionalDocuments: ['Prenatal notes'],
          sla: { businessDays: 7, escalationRole: 'manager' },
        },
        OPTICAL: {
          enabled: true,
          requiredDocuments: ['Claim form', 'Optical invoice', 'Prescription'],
          optionalDocuments: ['Optometry report'],
          sla: { businessDays: 7, escalationRole: 'manager' },
        },
      }),
      approval: {
        autoApprovalThreshold: 5_000,
        bands: [
          { minAmount: 5_000, maxAmount: 50_000, role: 'assessor' },
          { minAmount: 50_001, maxAmount: null, role: 'manager' },
        ],
      },
      notifications: notifications({
        claim_submitted: ['email', 'sms'],
        approved: ['email', 'sms'],
        rejected: ['email', 'sms'],
        payment_sent: ['email', 'sms'],
      }),
      customFields: [],
    },
  },
  {
    name: 'GovHealth',
    config: {
      branding: {
        companyName: 'GovHealth',
        logoUrl: '',
        primaryColor: '#6B4A1E',
        secondaryColor: '#F3EBDD',
      },
      claimTypes: claimTypes({
        OUTPATIENT: {
          enabled: true,
          requiredDocuments: [
            'Claim form',
            'Itemized receipt',
            'Department allocation record',
          ],
          optionalDocuments: ['Referral note'],
          sla: { businessDays: 15, escalationRole: 'committee' },
        },
        INPATIENT: {
          enabled: true,
          requiredDocuments: [
            'Claim form',
            'Hospital bill',
            'Discharge summary',
            'Budget authorization',
          ],
          optionalDocuments: ['Admission record'],
          sla: { businessDays: 15, escalationRole: 'committee' },
        },
      }),
      approval: {
        autoApprovalThreshold: 0,
        bands: [{ minAmount: 0, maxAmount: null, role: 'committee' }],
      },
      notifications: notifications({
        claim_submitted: ['email', 'webhook'],
        approved: ['email'],
        rejected: ['email'],
        payment_sent: ['email', 'webhook'],
      }),
      customFields: [
        {
          key: 'department',
          label: 'Department',
          type: 'text',
          required: true,
          maxLength: 255,
        },
        {
          key: 'budget_code',
          label: 'Budget Code',
          type: 'text',
          required: true,
          maxLength: 255,
        },
      ],
    },
  },
];
