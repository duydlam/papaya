import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { EnvironmentConfig } from './app/config/environment-config.interface';
import { HttpExceptionFilter } from './app/http-exception.filter';
import { ApiResponseInterceptor } from './app/api-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const config = app.get<ConfigService<EnvironmentConfig>>(ConfigService);
  app.enableCors({
    origin: config.get('WEB_ORIGIN') ?? 'http://localhost:3000',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ApiResponseInterceptor());
  await app.listen(Number(config.get('PORT') ?? 3001));
}
void bootstrap();
