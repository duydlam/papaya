import moment from 'moment';
import { DATE_ONLY_FORMAT } from '@papaya/contracts';

export const isDateOnly = (value: unknown): value is string =>
  typeof value === 'string' && moment(value, DATE_ONLY_FORMAT, true).isValid();
