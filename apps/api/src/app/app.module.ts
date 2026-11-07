import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { TenantModule } from './tenants/tenant.module';
import { ClaimProcessingModule } from './claim-processing/claim-processing.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'apps/api/.env' }),
    DatabaseModule,
    RedisModule,
    TenantModule,
    ClaimProcessingModule,
  ],
})
export class AppModule {}
