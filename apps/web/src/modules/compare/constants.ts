import _ from 'lodash';

export const CONFIG_DIFF_GROUPS = [
  ['branding', 'Branding'],
  ['claimTypes', 'Claim types & documents'],
  ['approval', 'Approval rules'],
  ['notifications', 'Notifications'],
  ['customFields', 'Custom fields'],
] as const;

export const COMPARE_STEPS = [
  { key: null, title: 'Select tenants' },
  ..._.map(CONFIG_DIFF_GROUPS, ([key, title]) => ({ key, title })),
];

export const DIFF_PATH_SEPARATOR = '.';
export const DIFF_CONTEXT_SEPARATOR = ' · ';
export const DIFF_CHANGE_CLASSES = {
  HIGHER: 'higher',
  LOWER: 'lower',
} as const;
export const DIFF_CHANGE_LABELS = {
  CHANGED: 'Changed',
  INCREASED: 'Increased',
  DECREASED: 'Decreased',
} as const;
