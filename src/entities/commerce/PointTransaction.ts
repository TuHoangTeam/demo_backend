import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { User } from '../user/User'; // Nhớ check đường dẫn import
import { Item } from '../item/Item';
import { Transaction } from './Transaction';

export enum PointTransactionType {
  INITIAL_BONUS = 'INITIAL_BONUS',
  ITEM_POSTED = 'ITEM_POSTED',
  ITEM_RECEIVED = 'ITEM_RECEIVED',
  ITEM_GIVEN = 'ITEM_GIVEN',
  DAILY_LOGIN = 'DAILY_LOGIN',
  ACHIEVEMENT = 'ACHIEVEMENT',
}

@Entity()
export class PointTransaction {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @Property()
  amount!: number;

  @Enum(() => PointTransactionType)
  type!: PointTransactionType;

  @Property()
  description!: string;

  @ManyToOne(() => Item, { nullable: true })
  relatedItem?: Item;

  @ManyToOne(() => Transaction, { nullable: true })
  relatedTransaction?: Transaction;

  @Property()
  balanceBefore!: number;

  @Property()
  balanceAfter!: number;

  // SỬA Ở ĐÂY: Thêm dấu ?
  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date(); 
}