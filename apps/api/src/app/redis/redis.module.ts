import {
  Global,
  Injectable,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS = 'REDIS';
@Injectable()
class RedisConnection implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly redis: Redis) {}
  async onModuleInit() {
    await this.redis.connect();
  }
  async onModuleDestroy() {
    await this.redis.quit();
  }
}

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: () =>
        new Redis({
          host: process.env.REDIS_HOST ?? 'localhost',
          port: Number(process.env.REDIS_PORT ?? 6379),
          password: process.env.REDIS_PASSWORD || undefined,
          db: Number(process.env.REDIS_DB ?? 0),
          lazyConnect: true,
          maxRetriesPerRequest: 1,
        }),
    },
    {
      provide: RedisConnection,
      useFactory: (redis: Redis) => new RedisConnection(redis),
      inject: [REDIS],
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
