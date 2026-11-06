import {
  Inject,
  Injectable,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { EnvironmentConfig } from '../config/environment-config.interface';
import { REDIS_CLIENT, RedisService } from './redis.service';

@Injectable()
class RedisConnection implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async onModuleInit(): Promise<void> {
    await this.redis.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentConfig>) =>
        new Redis({
          host: config.get('REDIS_HOST') ?? 'localhost',
          port: Number(config.get('REDIS_PORT') ?? 6379),
          password: config.get('REDIS_PASSWORD') || undefined,
          db: Number(config.get('REDIS_DB') ?? 0),
          lazyConnect: true,
          maxRetriesPerRequest: 1,
        }),
    },
    RedisConnection,
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
