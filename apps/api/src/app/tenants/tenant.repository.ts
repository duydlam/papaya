import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { TenantConfigVersion } from '../tenant-config/tenant-config-version.entity';
import { Tenant } from './tenant.entity';
import type { TenantSummaryRow, TenantWithCurrentConfig } from './tenant.types';

type TenantListQuery = {
  status?: Tenant['status'];
  page: number;
  pageSize: number;
  searchPattern?: string;
  excludeTenantId?: string;
};

@Injectable()
export class TenantRepository {
  constructor(private readonly dataSource: DataSource) {}

  async list({
    status,
    page,
    pageSize,
    searchPattern,
    excludeTenantId,
  }: TenantListQuery): Promise<{ rows: TenantSummaryRow[]; total: number }> {
    const query = this.dataSource
      .getRepository(Tenant)
      .createQueryBuilder('tenant')
      .leftJoin(
        TenantConfigVersion,
        'configVersion',
        'configVersion.tenantId = tenant.id AND configVersion.version = tenant.currentVersion',
      )
      .select('tenant.id', 'id')
      .addSelect('tenant.status', 'status')
      .addSelect('tenant.currentVersion', 'currentVersion')
      .addSelect('configVersion.config', 'config')
      .orderBy('tenant.createdAt', 'ASC')
      .addOrderBy('tenant.id', 'ASC');
    if (status) query.where('tenant.status = :status', { status });
    if (excludeTenantId)
      query.andWhere('tenant.id != :excludeTenantId', { excludeTenantId });
    if (searchPattern)
      query.andWhere(
        `"configVersion"."config"->'branding'->>'companyName' ILIKE :search ESCAPE '!'`,
        { search: searchPattern },
      );

    const [rows, total] = await Promise.all([
      query
        .clone()
        .offset((page - 1) * pageSize)
        .limit(pageSize)
        .getRawMany<TenantSummaryRow>(),
      query.getCount(),
    ]);
    return { rows, total };
  }

  findById(id: string, manager = this.dataSource.manager, lock = false) {
    return manager.findOne(Tenant, {
      where: { id },
      ...(lock ? { lock: { mode: 'pessimistic_write' as const } } : {}),
    });
  }

  findManyByIds(ids: string[]): Promise<TenantWithCurrentConfig[]> {
    return this.dataSource
      .getRepository(Tenant)
      .createQueryBuilder('tenant')
      .leftJoinAndMapOne(
        'tenant.currentConfig',
        TenantConfigVersion,
        'configVersion',
        'configVersion.tenantId = tenant.id AND configVersion.version = tenant.currentVersion',
      )
      .where('tenant.id IN (:...ids)', { ids })
      .getMany() as Promise<TenantWithCurrentConfig[]>;
  }

  findConfigVersion(
    tenantId: string,
    version: number,
    manager = this.dataSource.manager,
  ) {
    return manager.findOneBy(TenantConfigVersion, { tenantId, version });
  }

  findVersions(tenantId: string) {
    return this.dataSource.getRepository(TenantConfigVersion).find({
      where: { tenantId },
      order: { version: 'DESC' },
      select: ['version', 'createdAt', 'restoredFromVersion'],
    });
  }

  saveTenant(tenant: Tenant, manager: EntityManager) {
    return manager.save(tenant);
  }

  saveConfigVersion(
    configVersion: TenantConfigVersion,
    manager: EntityManager,
  ) {
    return manager.save(configVersion);
  }

  transaction<T>(work: (manager: EntityManager) => Promise<T>) {
    return this.dataSource.transaction(work);
  }
}
