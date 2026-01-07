import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TransactionController } from './transaction.controller';
import { Transaction } from '../../entities/commerce/Transaction';
import { PointTransaction } from '../../entities/commerce/PointTransaction';
import { Item } from '../../entities/item/Item';
import { User } from '../../entities/user/User';

@Module({
  imports: [
    // Import tất cả các Entity mà Controller cần dùng
    MikroOrmModule.forFeature([Transaction, PointTransaction, Item, User]),
  ],
  controllers: [TransactionController],
  providers: [],
})
export class TransactionModule {}