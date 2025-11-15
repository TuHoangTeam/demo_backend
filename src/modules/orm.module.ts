import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { User } from '../entities/User';
import { Product } from '../entities/Product';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    MikroOrmModule.forRoot(),
    MikroOrmModule.forFeature({
      entities: [User, Product],
    }),
    ReviewsModule,
  ],
  exports: [MikroOrmModule],
})
export class OrmModule {}
