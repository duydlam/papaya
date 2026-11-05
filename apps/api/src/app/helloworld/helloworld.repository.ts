import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HelloWorld } from './helloworld.entity';

@Injectable()
export class HelloWorldRepository {
  constructor(
    @InjectRepository(HelloWorld)
    private readonly repository: Repository<HelloWorld>,
  ) {}
  findAll() {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }
  findById(id: string) {
    return this.repository.findOneBy({ id });
  }
  create(message: string) {
    return this.repository.save(this.repository.create({ message }));
  }
  async update(id: string, message: string) {
    const entity = await this.findById(id);
    if (!entity) return null;
    entity.message = message;
    return this.repository.save(entity);
  }
  async delete(id: string) {
    return (await this.repository.delete(id)).affected !== 0;
  }
}
