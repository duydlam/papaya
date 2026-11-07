import {
  InternalServerErrorException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import type { TenantConfig, TenantPage } from '@papaya/contracts';
import type { EntityManager } from 'typeorm';
import { TenantConfigVersion } from '../tenant-config/tenant-config-version.entity';
import { TenantDetailsDto, TenantSummaryDto } from './tenant.dto';
import { Tenant } from './tenant.entity';
import { TenantLatestConfigCacheService } from './tenant-latest-config-cache.service';
import { TenantRepository } from './tenant.repository';
import { diffTenantConfig } from './tenant.utils';
import type {
  TenantSummarySource,
  TenantWithCurrentConfig,
  TenantWithRequiredCurrentConfig,
} from './tenant.types';

@Injectable()
export class TenantService {
  constructor(
    private readonly repository: TenantRepository,
    private readonly latestConfigCache: TenantLatestConfigCacheService,
  ) {}

  async list(query: {
    includeArchived: boolean;
    page: number;
    pageSize: number;
    search?: string;
    excludeTenantId?: string;
  }): Promise<TenantPage> {
    const search = _.trim(query.search ?? '');
    const { rows, total } = await this.repository.list({
      status: query.includeArchived ? undefined : 'active',
      page: query.page,
      pageSize: query.pageSize,
      excludeTenantId: query.excludeTenantId,
      searchPattern: search
        ? `%${search.replace(/[!%_]/g, '!$&')}%`
        : undefined,
    });
    const rowsWithConfig = _.filter(rows, (row): row is TenantSummarySource =>
      Boolean(row.config),
    );
    if (rowsWithConfig.length !== rows.length)
      throw new InternalServerErrorException(
        'Tenant config version is missing',
      );

    return {
      items: TenantSummaryDto.fromEntities(rowsWithConfig),
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }

  async get(id: string): Promise<TenantDetailsDto> {
    return this.latestConfigCache.get(id, () => this.loadTenantDetails(id));
  }

  create(config: TenantConfig) {
    return this.repository.transaction(async (manager) => {
      const tenant = await this.repository.saveTenant(
        manager.create(Tenant, { status: 'active', currentVersion: 1 }),
        manager,
      );
      await this.repository.saveConfigVersion(
        manager.create(TenantConfigVersion, {
          tenantId: tenant.id,
          version: 1,
          config,
          restoredFromVersion: null,
        }),
        manager,
      );
      return this.details(tenant, manager);
    });
  }

  async updateConfig(id: string, config: TenantConfig) {
    const details = await this.repository.transaction(async (manager) => {
      const tenant = await this.activeTenant(id, manager);
      tenant.currentVersion += 1;
      await this.repository.saveConfigVersion(
        manager.create(TenantConfigVersion, {
          tenantId: tenant.id,
          version: tenant.currentVersion,
          config,
          restoredFromVersion: null,
        }),
        manager,
      );
      await this.repository.saveTenant(tenant, manager);
      return this.details(tenant, manager);
    });
    await this.latestConfigCache.invalidate(id);
    return details;
  }

  async archive(id: string): Promise<void> {
    await this.repository.transaction(async (manager) => {
      const tenant = await this.activeTenant(id, manager);
      tenant.status = 'archived';
      tenant.archivedAt = moment().toDate();
      await this.repository.saveTenant(tenant, manager);
    });
    await this.latestConfigCache.invalidate(id);
  }

  async versions(tenantId: string) {
    if (!(await this.repository.findById(tenantId)))
      throw new NotFoundException('Tenant not found');
    return this.repository.findVersions(tenantId);
  }

  async version(tenantId: string, version: number) {
    if (!(await this.repository.findById(tenantId)))
      throw new NotFoundException('Tenant not found');
    const configVersion = await this.repository.findConfigVersion(
      tenantId,
      version,
    );
    if (!configVersion) throw new NotFoundException('Config version not found');
    return configVersion;
  }

  async restore(id: string, sourceVersion: number) {
    const details = await this.repository.transaction(async (manager) => {
      const tenant = await this.activeTenant(id, manager);
      const source = await this.repository.findConfigVersion(
        id,
        sourceVersion,
        manager,
      );
      if (!source) throw new NotFoundException('Config version not found');

      tenant.currentVersion += 1;
      await this.repository.saveConfigVersion(
        manager.create(TenantConfigVersion, {
          tenantId: id,
          version: tenant.currentVersion,
          config: source.config,
          restoredFromVersion: sourceVersion,
        }),
        manager,
      );
      await this.repository.saveTenant(tenant, manager);
      return this.details(tenant, manager);
    });
    await this.latestConfigCache.invalidate(id);
    return details;
  }

  async compare(leftId: string, rightId: string) {
    const ids = [leftId, rightId];
    const [left, right] = await this.getComparisonTenants(ids);
    return this.buildComparisonResult(left, right);
  }

  private async getComparisonTenants(ids: string[]) {
    const tenants = await this.repository.findManyByIds(ids);
    const activeTenants = this.getActiveComparisonTenants(ids, tenants);
    const tenantsWithConfig = this.getComparisonTenantDetails(activeTenants);
    return this.orderComparisonTenants(ids, tenantsWithConfig);
  }

  private getActiveComparisonTenants(
    ids: string[],
    tenants: TenantWithCurrentConfig[],
  ) {
    const activeTenants = _.filter(tenants, { status: 'active' });
    if (_.uniqBy(activeTenants, 'id').length !== _.uniq(ids).length)
      throw new NotFoundException('Tenant not found');
    return activeTenants;
  }

  private getComparisonTenantDetails(tenants: TenantWithCurrentConfig[]) {
    const tenantsWithConfig = _.filter(
      tenants,
      (tenant): tenant is TenantWithRequiredCurrentConfig =>
        Boolean(tenant.currentConfig),
    );
    if (tenantsWithConfig.length !== tenants.length)
      throw new InternalServerErrorException(
        'Tenant config version is missing',
      );
    return TenantDetailsDto.fromEntities(tenantsWithConfig);
  }

  private orderComparisonTenants(ids: string[], tenants: TenantDetailsDto[]) {
    return _.flatMap(ids, (id) => _.filter(tenants, { id }));
  }

  private buildComparisonResult(
    left: TenantDetailsDto,
    right: TenantDetailsDto,
  ) {
    return {
      left: {
        id: left.id,
        companyName: left.companyName,
        version: left.currentVersion,
      },
      right: {
        id: right.id,
        companyName: right.companyName,
        version: right.currentVersion,
      },
      differences: diffTenantConfig(left.config, right.config),
    };
  }

  private async activeTenant(id: string, manager: EntityManager) {
    const tenant = await this.repository.findById(id, manager, true);
    if (!tenant || tenant.status === 'archived')
      throw new NotFoundException('Tenant not found');
    return tenant;
  }

  private async loadTenantDetails(id: string) {
    const tenant = await this.repository.findById(id);
    if (!tenant || tenant.status === 'archived')
      throw new NotFoundException('Tenant not found');
    return this.details(tenant);
  }

  private async details(tenant: Tenant, manager?: EntityManager) {
    const current = await this.repository.findConfigVersion(
      tenant.id,
      tenant.currentVersion,
      manager,
    );
    if (!current)
      throw new InternalServerErrorException(
        'Tenant config version is missing',
      );
    return TenantDetailsDto.from({ ...tenant, config: current.config });
  }
}
