import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { TenantController } from './tenant.controller';
import { TenantLatestConfigCacheService } from './tenant-latest-config-cache.service';
import { TenantRepository } from './tenant.repository';
import { TenantService } from './tenant.service';

@Module({
  imports: [RedisModule],
  controllers: [TenantController],
  providers: [TenantLatestConfigCacheService, TenantRepository, TenantService],
  exports: [TenantService],
})
export class TenantModule {}
