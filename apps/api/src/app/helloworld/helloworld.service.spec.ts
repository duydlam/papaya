import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { HelloWorldService } from './helloworld.service';

describe('HelloWorldService', () => {
  const repository = {
    findAll: jest.fn<() => Promise<unknown[]>>(),
    findById:
      jest.fn<
        (id: string) => Promise<{ id: string; message: string } | null>
      >(),
    create:
      jest.fn<(message: string) => Promise<{ id: string; message: string }>>(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const service = new HelloWorldService(repository as never);
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a message through the repository', async () => {
    repository.create.mockResolvedValue({ id: '1', message: 'hello' });
    await expect(service.create('hello')).resolves.toEqual({
      id: '1',
      message: 'hello',
    });
    expect(repository.create).toHaveBeenCalledWith('hello');
  });

  it('returns 404 when an item does not exist', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.findById('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
