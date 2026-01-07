import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RatingController } from './rating.controller';

// Import Entities
import { Rating } from '../../entities/social/Rating';
import { User } from '../../entities/user/User';
import { Transaction } from '../../entities/commerce/Transaction';

@Module({
  imports: [
    MikroOrmModule.forFeature([Rating, User, Transaction]),
  ],
  controllers: [RatingController],
  providers: [],
})
export class RatingModule {}