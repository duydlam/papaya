import {
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isDateOnly } from '../common/date.utils';

@ValidatorConstraint({ name: 'dateOnly', async: false })
class DateOnlyConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return isDateOnly(value);
  }

  defaultMessage() {
    return 'submittedDate must be a valid YYYY-MM-DD date';
  }
}

export const IsDateOnly = () => Validate(DateOnlyConstraint);
