import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelloWorld } from '../helloworld/helloworld.entity';
import { CreateHelloWorldTable1720000000000 } from './1720000000000-CreateHelloWorldTable';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'papaya',
      password: process.env.DB_PASSWORD ?? 'papaya',
      database: process.env.DB_NAME ?? 'papaya',
      schema: process.env.DB_SCHEMA ?? 'public',
      entities: [HelloWorld],
      migrations: [CreateHelloWorldTable1720000000000],
      migrationsRun: process.env.DB_SYNC !== 'true',
      synchronize:
        process.env.DB_SYNC === 'true' || process.env.NODE_ENV !== 'production',
    }),
  ],
})
export class DatabaseModule {}
