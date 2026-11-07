import { describe, expect, it, jest } from '@jest/globals';
import type { RedisService } from '../src/app/redis/redis.service';
import { TENANT_LATEST_CACHE_TTL_SECONDS } from '../src/app/tenants/tenant.constants';
import { TenantDetailsDto } from '../src/app/tenants/tenant.dto';
import { TenantLatestConfigCacheService } from '../src/app/tenants/tenant-latest-config-cache.service';

describe('TenantLatestConfigCacheService', () => {
  it('loads and caches the latest tenant details on a cache miss', async () => {
    const details = { currentVersion: 2 } as TenantDetailsDto;
    const redis = {
      get: jest.fn<RedisService['get']>().mockResolvedValue(null),
      set: jest.fn<RedisService['set']>().mockResolvedValue('OK'),
      delete: jest.fn<RedisService['delete']>().mockResolvedValue(true),
    } as unknown as RedisService;
    const cache = new TenantLatestConfigCacheService(redis);
    const load = jest.fn(async () => details);

    await expect(cache.get('tenant-id', load)).resolves.toBe(details);

    expect(load).toHaveBeenCalledTimes(1);
    expect(redis.set).toHaveBeenCalledWith(
      'tenant:latest:tenant-id',
      JSON.stringify(details),
      TENANT_LATEST_CACHE_TTL_SECONDS,
    );
  });

  it('returns cached tenant details without loading the database', async () => {
    const details = { currentVersion: 3 } as TenantDetailsDto;
    const redis = {
      get: jest
        .fn<RedisService['get']>()
        .mockResolvedValue(JSON.stringify(details)),
      set: jest.fn<RedisService['set']>().mockResolvedValue('OK'),
      delete: jest.fn<RedisService['delete']>().mockResolvedValue(true),
    } as unknown as RedisService;
    const cache = new TenantLatestConfigCacheService(redis);
    const load = jest.fn(async () => details);

    await expect(cache.get('tenant-id', load)).resolves.toEqual(details);

    expect(load).not.toHaveBeenCalled();
    expect(redis.set).not.toHaveBeenCalled();
  });
});
