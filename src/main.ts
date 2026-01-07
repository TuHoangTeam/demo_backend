import 'dotenv/config'; // Very important!

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MikroORM } from '@mikro-orm/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// Import interface của Express Adapter
import { NestExpressApplication } from '@nestjs/platform-express'; 
import { join } from 'path';

import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';

function createWinstonOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  const useGcpCloudLogging = process.env.USE_GCP_CLOUD_LOGGING !== undefined && ['true', 'on', 'yes', '1'].includes(process.env.USE_GCP_CLOUD_LOGGING.toLowerCase());

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

  if (useGcpCloudLogging) {
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
  // --- SỬA LỖI Ở ĐÂY ---
  // Thêm <NestExpressApplication> để ép kiểu ứng dụng về Express
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(createWinstonOptions()),
  });

  // Tự động tạo bảng nếu chưa có (Chỉ nên dùng khi dev, production nên dùng migration)
  // Lưu ý: Cần chắc chắn MikroORM đã kết nối thành công trước khi chạy dòng này
  try {
    const orm = app.get(MikroORM);
    const generator = orm.getSchemaGenerator();
    await generator.ensureDatabase();
    await generator.updateSchema(); 
  } catch (error) {
    console.error('Lỗi khởi tạo database:', error);
  }

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Bây giờ dòng này sẽ chạy ngon lành vì app đã hiểu là NestExpressApplication
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', 
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mobile Demo API')
    .setDescription('API documentation for Mobile Application Development demo')
    .setVersion('1.0')
    .addTag('user')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
  
  // Bật CORS để frontend/mobile gọi được API
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();