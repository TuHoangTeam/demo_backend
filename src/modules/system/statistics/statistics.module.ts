import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { StatisticsController } from './statistics.controller';
import { User } from '../../../entities/user/User';
import { Item } from '../../../entities/item/Item';
import { Transaction } from '../../../entities/commerce/Transaction';

@Module({
  imports: [MikroOrmModule.forFeature([User, Item, Transaction])],
  controllers: [StatisticsController],
})
export class StatisticsModule {}