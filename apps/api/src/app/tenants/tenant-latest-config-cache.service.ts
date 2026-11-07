import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import {
  TENANT_LATEST_CACHE_KEY_PREFIX,
  TENANT_LATEST_CACHE_TTL_SECONDS,
} from './tenant.constants';
import { TenantDetailsDto } from './tenant.dto';

@Injectable()
export class TenantLatestConfigCacheService {
  constructor(private readonly redis: RedisService) {}

  async get(
    id: string,
    load: () => Promise<TenantDetailsDto>,
  ): Promise<TenantDetailsDto> {
    try {
      const cached = await this.redis.get(this.key(id));
      if (cached) return JSON.parse(cached) as TenantDetailsDto;
    } catch {
      // Redis is an optional cache; the database remains the source of truth.
    }

    const details = await load();
    try {
      await this.redis.set(
        this.key(id),
        JSON.stringify(details),
        TENANT_LATEST_CACHE_TTL_SECONDS,
      );
    } catch {
      // Redis is an optional cache; the database remains the source of truth.
    }
    return details;
  }

  async invalidate(id: string) {
    try {
      await this.redis.delete(this.key(id));
    } catch {
      // The cache TTL bounds stale data if Redis is temporarily unavailable.
    }
  }

  private key(id: string) {
    return `${TENANT_LATEST_CACHE_KEY_PREFIX}${id}`;
  }
}
