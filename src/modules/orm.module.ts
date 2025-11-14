import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { User } from '../entities/User';
import { Product } from '../entities/Product';

@Module({
  imports: [
    MikroOrmModule.forRoot(),
    MikroOrmModule.forFeature({
      entities: [User, Product],
    }),
  ],
  exports: [MikroOrmModule],
})
export class OrmModule {}
