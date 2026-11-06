import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ServiceUnavailableException } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService } from '../src/app/redis/redis.service';

describe('RedisService', () => {
  const redis = {
    get: jest.fn<(key: string) => Promise<string | null>>(),
    set: jest.fn<
      (
        key: string,
        value: string,
        ...args: (string | number)[]
      ) => Promise<'OK'>
    >(),
    del: jest.fn<(key: string) => Promise<number>>(),
    exists: jest.fn<(key: string) => Promise<number>>(),
    incr: jest.fn<(key: string) => Promise<number>>(),
    decr: jest.fn<(key: string) => Promise<number>>(),
    expire: jest.fn<(key: string, seconds: number) => Promise<number>>(),
  };
  const service = new RedisService(redis as unknown as Redis);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('supports expiring values through the Redis client', async () => {
    redis.set.mockResolvedValue('OK');

    await expect(service.set('session', 'token', 60)).resolves.toBe('OK');
    expect(redis.set).toHaveBeenCalledWith('session', 'token', 'EX', 60);
  });

  it('turns Redis failures into a service unavailable error', async () => {
    redis.get.mockRejectedValue(new Error('connection refused'));

    await expect(service.get('key')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
