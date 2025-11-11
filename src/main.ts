import 'dotenv/config'; // Very important!

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MikroORM } from '@mikro-orm/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';

function createWinstonOptions() {
  const isProduction = process.env.NODE_ENV === 'production';

  const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(
      ({ timestamp, level, message, context, ...meta }) => {
        const contextString = context ? ` [${context}]` : '';
        const metaString = Object.keys(meta).length
          ? `\n${JSON.stringify(meta, null, 2)}`
          : '';

        return `${timestamp} ${level}${contextString}: ${message}${metaString}`;
      },
    ),
  );

  const transports: winston.transport[] = [];

  if (isProduction) {
    transports.push(new LoggingWinston());
  }
  transports.push(new winston.transports.Console({
    format: consoleFormat,
  }));

  return {
    level: isProduction ? 'info' : 'debug',
    transports
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(createWinstonOptions()),
  });

  await app.get(MikroORM).getSchemaGenerator().ensureDatabase();
  await app.get(MikroORM).getSchemaGenerator().updateSchema();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mobile Demo API')
    .setDescription('API documentation for Mobile Application Development demo')
    .setVersion('1.0')
    .addTag('user')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
