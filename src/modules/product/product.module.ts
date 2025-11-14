import { Module } from '@nestjs/common';
import { OrmModule } from '../orm.module';
import { ProductController } from './product.controller';

@Module({
  imports: [OrmModule],
  controllers: [ProductController],
})
export class ProductModule {}
