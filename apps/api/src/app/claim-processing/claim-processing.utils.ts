import { BadRequestException } from '@nestjs/common';
import { DATE_ONLY_FORMAT } from '@papaya/contracts';
import moment from 'moment';
import {
  BUSINESS_DAYS_PER_WEEK,
  CALENDAR_DAYS_PER_WEEK,
  FIRST_SLA_DAY_OFFSET,
} from './claim-processing.constants';

export const addBusinessDays = (
  submittedDate: string,
  businessDays: number,
) => {
  const date = moment
    .utc(submittedDate, DATE_ONLY_FORMAT, true)
    .add(FIRST_SLA_DAY_OFFSET, 'day');
  while (date.isValid() && date.isoWeekday() > BUSINESS_DAYS_PER_WEEK) {
    date.add(1, 'day');
  }

  let remaining = businessDays - FIRST_SLA_DAY_OFFSET;
  date.add(
    Math.floor(remaining / BUSINESS_DAYS_PER_WEEK) * CALENDAR_DAYS_PER_WEEK,
    'days',
  );
  remaining %= BUSINESS_DAYS_PER_WEEK;
  while (remaining > 0 && date.isValid()) {
    date.add(1, 'day');
    if (date.isoWeekday() <= BUSINESS_DAYS_PER_WEEK) remaining -= 1;
  }
  if (!date.isValid()) {
    throw new BadRequestException(
      'SLA deadline is outside the supported date range',
    );
  }
  return date.format(DATE_ONLY_FORMAT);
};
