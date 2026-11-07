import { DATE_ONLY_FORMAT, type ClaimPreviewInput } from '@papaya/contracts';
import moment from 'moment';

export { CLAIM_TYPES } from '@papaya/contracts';

export const DEFAULT_CLAIM: Omit<ClaimPreviewInput, 'tenantId'> = {
  claimType: 'OUTPATIENT',
  amount: 15000,
  submittedDate: moment().format(DATE_ONLY_FORMAT),
  customFieldValues: {},
};
