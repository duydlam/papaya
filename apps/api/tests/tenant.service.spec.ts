import { describe, expect, it, jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { sampleTenantConfigs } from '../src/app/database/seeds/sample-tenant-configs';
import { TenantService } from '../src/app/tenants/tenant.service';
import { TenantRepository } from '../src/app/tenants/tenant.repository';
import type { TenantWithCurrentConfig } from '../src/app/tenants/tenant.types';
import type { TenantLatestConfigCacheService } from '../src/app/tenants/tenant-latest-config-cache.service';

const makeTenant = (
  id: string,
  status: 'active' | 'archived',
  config = sampleTenantConfigs[0].config,
): TenantWithCurrentConfig =>
  ({
    id,
    status,
    currentVersion: 1,
    currentConfig: { config },
  }) as TenantWithCurrentConfig;

describe('TenantService', () => {
  const latestConfigCache = {
    get: jest
      .fn<TenantLatestConfigCacheService['get']>()
      .mockImplementation((_id, load) => load()),
    invalidate: jest
      .fn<TenantLatestConfigCacheService['invalidate']>()
      .mockResolvedValue(undefined),
  } as unknown as TenantLatestConfigCacheService;

  it('prepares database filters and maps the paginated tenant rows', async () => {
    const config = sampleTenantConfigs[0].config;
    const repository = {
      list: jest.fn<TenantRepository['list']>().mockResolvedValue({
        rows: [
          {
            id: 'tenant-id',
            status: 'active',
            currentVersion: 1,
            config,
          },
        ],
        total: 1,
      }),
    } as unknown as TenantRepository;
    const service = new TenantService(repository, latestConfigCache);

    const result = await service.list({
      includeArchived: false,
      page: 2,
      pageSize: 10,
      search: 'Safe_%',
      excludeTenantId: 'excluded-tenant-id',
    });

    expect(repository.list).toHaveBeenCalledWith({
      status: 'active',
      page: 2,
      pageSize: 10,
      searchPattern: '%Safe!_!%%',
      excludeTenantId: 'excluded-tenant-id',
    });
    expect(result.items[0]).toMatchObject({
      id: 'tenant-id',
      companyName: 'SafeGuard Insurance',
    });
  });

  it('compares one batch, filters archived tenants, and preserves requested order', async () => {
    const repository = {
      findManyByIds: jest
        .fn<TenantRepository['findManyByIds']>()
        .mockResolvedValue([
          makeTenant('right', 'active', sampleTenantConfigs[1].config),
          makeTenant('left', 'active'),
        ]),
    } as unknown as TenantRepository;
    const service = new TenantService(repository, latestConfigCache);

    const result = await service.compare('left', 'right');

    expect(repository.findManyByIds).toHaveBeenCalledWith(['left', 'right']);
    expect(result.left).toMatchObject({
      id: 'left',
      companyName: 'SafeGuard Insurance',
    });
    expect(result.right).toMatchObject({
      id: 'right',
      companyName: 'HealthFirst',
    });
  });

  it('treats an archived comparison tenant as not found', async () => {
    const repository = {
      findManyByIds: jest
        .fn<TenantRepository['findManyByIds']>()
        .mockResolvedValue([makeTenant('left', 'active')]),
    } as unknown as TenantRepository;
    const service = new TenantService(repository, latestConfigCache);

    await expect(service.compare('left', 'right')).rejects.toThrow(
      NotFoundException,
    );
  });
});
