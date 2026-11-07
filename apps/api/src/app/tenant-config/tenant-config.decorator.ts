import { BadRequestException } from '@nestjs/common';
import {
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import _ from 'lodash';
import { validateTenantConfig } from './tenant-config.validator';

@ValidatorConstraint({ name: 'tenantConfig', async: false })
class TenantConfigConstraint implements ValidatorConstraintInterface {
  private message = '';

  validate(value: unknown) {
    try {
      validateTenantConfig(value);
      return true;
    } catch (error) {
      if (!(error instanceof BadRequestException)) throw error;
      this.message = _.join(
        _.castArray(_.get(error.getResponse(), 'message')),
        ', ',
      );
      return false;
    }
  }

  defaultMessage() {
    return this.message || 'Invalid tenant configuration';
  }
}

export const IsTenantConfig = () => Validate(TenantConfigConstraint);
