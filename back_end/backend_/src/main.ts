import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser()); // enable us to parse and process cookie from browser request
  app.enableCors({}); // we use it because we have the front and the back working on a different ports
  await app.listen(3003);
}
bootstrap();