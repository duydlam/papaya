import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironmentConfig } from '../config/environment-config.interface';
import { CreateHelloWorldTable1720000000000 } from './1720000000000-CreateHelloWorldTable';
import { CreateTenantConfiguration1730000000000 } from './1730000000000-CreateTenantConfiguration';
import { TenantConfigVersion } from '../tenant-config/tenant-config-version.entity';
import { Tenant } from '../tenants/tenant.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentConfig>) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST') ?? 'localhost',
        port: Number(config.get<string>('DB_PORT') ?? 5432),
        username: config.get<string>('DB_USER') ?? 'papaya',
        password: config.get<string>('DB_PASSWORD') ?? 'papaya',
        database: config.get<string>('DB_NAME') ?? 'papaya',
        schema: config.get<string>('DB_SCHEMA') ?? 'public',
        entities: [Tenant, TenantConfigVersion],
        migrations: [
          CreateHelloWorldTable1720000000000,
          CreateTenantConfiguration1730000000000,
        ],
        migrationsRun: true,
        synchronize: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
