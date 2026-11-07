import { Type } from 'class-transformer';
import _ from 'lodash';
import {
  IsBooleanString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type {
  TenantConfig,
  TenantDetails,
  TenantSummary,
} from '@papaya/contracts';
import { IsTenantConfig } from '../tenant-config/tenant-config.decorator';
import type {
  TenantSummarySource,
  TenantWithRequiredCurrentConfig,
} from './tenant.types';

export class TenantSummaryDto implements TenantSummary {
  id!: string;
  status!: TenantSummary['status'];
  currentVersion!: number;
  companyName!: string;
  enabledClaimTypes!: TenantSummary['enabledClaimTypes'];

  static from({ id, status, currentVersion, config }: TenantSummarySource) {
    return Object.assign(new TenantSummaryDto(), {
      id,
      status,
      currentVersion,
      companyName: config.branding.companyName,
      enabledClaimTypes: _.chain(config.claimTypes)
        .toPairs()
        .filter(([, claimConfig]) => claimConfig.enabled)
        .map(([claimType]) => claimType)
        .value() as TenantSummary['enabledClaimTypes'],
    });
  }

  static fromEntities(entities: TenantSummarySource[]) {
    return _.map(entities, TenantSummaryDto.from);
  }
}

export class TenantDetailsDto implements TenantDetails {
  id!: string;
  status!: TenantDetails['status'];
  currentVersion!: number;
  companyName!: string;
  enabledClaimTypes!: TenantDetails['enabledClaimTypes'];
  config!: TenantConfig;

  static from(input: TenantSummarySource) {
    return Object.assign(new TenantDetailsDto(), TenantSummaryDto.from(input), {
      config: input.config,
    });
  }

  static fromEntities(entities: TenantWithRequiredCurrentConfig[]) {
    return _.map(entities, ({ currentConfig, ...tenant }) =>
      TenantDetailsDto.from({ ...tenant, config: currentConfig.config }),
    );
  }
}

export class SaveTenantConfigDto {
  @IsTenantConfig()
  config!: TenantConfig;
}

export class CreateTenantDto extends SaveTenantConfigDto {}

export class TenantListQueryDto {
  @IsOptional()
  @IsBooleanString()
  includeArchived?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize = 10;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsUUID()
  excludeTenantId?: string;
}
