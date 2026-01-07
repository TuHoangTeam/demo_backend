import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CategoryController } from './category.controller';
import { Category } from '../../../entities/item/Category';

@Module({
  imports: [MikroOrmModule.forFeature([Category])],
  controllers: [CategoryController],
})
export class CategoryModule {}