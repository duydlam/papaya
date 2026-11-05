import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { HelloWorldModule } from './helloworld/helloworld.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'apps/api/.env' }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    HelloWorldModule,
  ],
})
export class AppModule {}
