import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironmentConfig } from '../config/environment-config.interface';
import { HelloWorld } from '../helloworld/helloworld.entity';
import { CreateHelloWorldTable1720000000000 } from './1720000000000-CreateHelloWorldTable';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentConfig>) => {
        const dbSync = config.get<string>('DB_SYNC');
        return {
          type: 'postgres' as const,
          host: config.get<string>('DB_HOST') ?? 'localhost',
          port: Number(config.get<string>('DB_PORT') ?? 5432),
          username: config.get<string>('DB_USER') ?? 'papaya',
          password: config.get<string>('DB_PASSWORD') ?? 'papaya',
          database: config.get<string>('DB_NAME') ?? 'papaya',
          schema: config.get<string>('DB_SCHEMA') ?? 'public',
          entities: [HelloWorld],
          migrations: [CreateHelloWorldTable1720000000000],
          migrationsRun: dbSync !== 'true',
          synchronize:
            dbSync === 'true' ||
            config.get<string>('NODE_ENV') !== 'production',
        };
      },
    }),
  ],
})
export class DatabaseModule {}
