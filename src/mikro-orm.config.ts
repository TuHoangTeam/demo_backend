import { Logger } from '@nestjs/common';
import { defineConfig } from '@mikro-orm/postgresql';
import { User } from './entities/User';
import { Product } from './entities/Product';

const logger = new Logger('MikroORM');

export default defineConfig({
  entities: [User, Product],
  dbName: 'mobile-demo',
  port: 5432,
  debug: true,
  logger: logger.log.bind(logger),

  user: process.env.POSTGRES_USERNAME ?? 'postgres',
  password: process.env.POSTGRES_PASSWORD ?? 'postgres'
});