import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  get(key: string): Promise<string | null> {
    return this.execute(() => this.redis.get(key));
  }

  set(key: string, value: string, ttlSeconds?: number): Promise<'OK'> {
    return this.execute(() =>
      ttlSeconds
        ? this.redis.set(key, value, 'EX', ttlSeconds)
        : this.redis.set(key, value),
    );
  }

  async delete(key: string): Promise<boolean> {
    return (await this.execute(() => this.redis.del(key))) > 0;
  }

  async exists(key: string): Promise<boolean> {
    return (await this.execute(() => this.redis.exists(key))) > 0;
  }

  increment(key: string): Promise<number> {
    return this.execute(() => this.redis.incr(key));
  }

  decrement(key: string): Promise<number> {
    return this.execute(() => this.redis.decr(key));
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    return (await this.execute(() => this.redis.expire(key, ttlSeconds))) > 0;
  }

  private async execute<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logger.error(
        'Redis operation failed',
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServiceUnavailableException('Redis is temporarily unavailable');
    }
  }
}
