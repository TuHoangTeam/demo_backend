import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { User } from '../user/User';
import { Item } from '../item/Item';

export enum TransactionStatus {
  PENDING = 'PENDING',       // Mới tạo, chờ người cho đồng ý
  CONFIRMED = 'CONFIRMED',   // Đã đồng ý, chờ gặp mặt
  COMPLETED = 'COMPLETED',   // Giao dịch thành công
  CANCELLED = 'CANCELLED',   // Đã hủy
}

@Entity()
export class Transaction {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => Item)
  item!: Item;

  @ManyToOne(() => User)
  giver!: User; // Người cho (thường là item.owner)

  @ManyToOne(() => User)
  receiver!: User; // Người nhận (User đang request)

  @Enum(() => TransactionStatus)
  status: TransactionStatus = TransactionStatus.PENDING;

  // Cờ xác nhận 2 chiều
  @Property()
  giverConfirmed?: boolean = false;

  @Property()
  receiverConfirmed?: boolean = false;

  @Property({ nullable: true })
  meetingLocation?: string;

  @Property({ nullable: true })
  meetingTime?: Date;

  @Property({ type: 'float', default: 0 })
  co2Saved?: number = 0;

  @Property({ type: 'float', default: 0 })
  trashReduced?: number = 0;

  @Property({ default: 0 })
  giverPointsEarned?: number = 0;

  @Property({ default: 0 })
  receiverPointsPaid?: number = 0;

  @Property({ nullable: true })
  completedAt?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt?: Date = new Date();
}