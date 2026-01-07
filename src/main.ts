import 'dotenv/config'; 

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MikroORM } from '@mikro-orm/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(createWinstonOptions()),
  });

  // Tự động update schema DB (Chỉ dùng cho dev)
  try {
    const orm = app.get(MikroORM);
    const generator = orm.getSchemaGenerator();
    await generator.ensureDatabase();
    await generator.updateSchema(); 
  } catch (error) {
    console.error('Database connection error:', error);
  }

  // Validate dữ liệu đầu vào
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true, // Tự động convert kiểu dữ liệu (vd: string -> number)
  }));

  // Serve static files (ảnh upload)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', 
  });

  // Cấu hình Swagger API Doc
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Give & Take API')
    .setDescription('API documentation for Give & Take Mobile App')
    .setVersion('1.0')
    // Thêm xác thực Bearer Token (JWT) cho Swagger
    .addBearerAuth() 
    // Thêm các tag để nhóm API cho đẹp
    .addTag('auth', 'Authentication')
    .addTag('users', 'User Management')
    .addTag('items', 'Item & Discovery')
    .addTag('transactions', 'Transaction Process')
    .addTag('ratings', 'Rating & Reviews')
    .addTag('wishlists', 'Wishlist & Matching')
    .addTag('notifications', 'System Notifications')
    .addTag('favorites', 'User Favorites')
    .addTag('categories', 'System Categories')
    .addTag('reports', 'User Reports')
    .addTag('stats', 'System Statistics')
    .addTag('achievements', 'Gamification & Rewards')
    .addTag('points', 'Point System')
    .addTag('eco', 'Eco Impact')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
  
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger Docs available at: ${await app.getUrl()}/api`);
}
bootstrap();