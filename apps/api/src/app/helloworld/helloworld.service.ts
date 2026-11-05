import { Injectable, NotFoundException } from '@nestjs/common';
import { HelloWorldRepository } from './helloworld.repository';

@Injectable()
export class HelloWorldService {
  constructor(private readonly repository: HelloWorldRepository) {}
  findAll() {
    return this.repository.findAll();
  }
  findById(id: string) {
    return this.repository.findById(id).then((item) => {
      if (!item) throw new NotFoundException('HelloWorld not found');
      return item;
    });
  }
  create(message: string) {
    return this.repository.create(message);
  }
  update(id: string, message: string) {
    return this.repository.update(id, message).then((item) => {
      if (!item) throw new NotFoundException('HelloWorld not found');
      return item;
    });
  }
  delete(id: string) {
    return this.repository.delete(id).then((deleted) => {
      if (!deleted) throw new NotFoundException('HelloWorld not found');
    });
  }
}
