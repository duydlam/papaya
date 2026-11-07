exports.DATE_ONLY_FORMAT = 'YYYY-MM-DD';
exports.CUSTOM_FIELD_TEXT_MAX_LENGTH = 255;

exports.CLAIM_TYPES = [
  'OUTPATIENT',
  'INPATIENT',
  'DENTAL',
  'MATERNITY',
  'OPTICAL',
];

exports.NOTIFICATION_EVENTS = [
  'claim_submitted',
  'approved',
  'rejected',
  'payment_sent',
];

exports.NOTIFICATION_CHANNELS = ['email', 'sms', 'webhook'];
