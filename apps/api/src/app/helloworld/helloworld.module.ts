import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HelloWorldController } from './helloworld.controller';
import { HelloWorld } from './helloworld.entity';
import { HelloWorldRepository } from './helloworld.repository';
import { HelloWorldService } from './helloworld.service';

@Module({
  imports: [TypeOrmModule.forFeature([HelloWorld]), AuthModule],
  controllers: [HelloWorldController],
  providers: [HelloWorldService, HelloWorldRepository, JwtAuthGuard],
})
export class HelloWorldModule {}
