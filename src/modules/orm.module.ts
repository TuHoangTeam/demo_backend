import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { User } from '../entities/user/User';
import { Item } from '../entities/item/Item';
import { RatingModule } from './rating/rating.module';

@Module({
  imports: [
    MikroOrmModule.forRoot(),
    MikroOrmModule.forFeature({
      entities: [User, Item],
    }),
    RatingModule,
  ],
  exports: [MikroOrmModule],
})
export class OrmModule {}
