import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Transaction } from '../commerce/Transaction';
import { User } from '../user/User';

@Entity()
export class Rating {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  // Đánh giá phải gắn liền với 1 giao dịch cụ thể
  @ManyToOne(() => Transaction)
  transaction!: Transaction;

  @ManyToOne(() => User)
  fromUser!: User;

  @ManyToOne(() => User)
  toUser!: User;

  @Property()
  rating!: number; // 1-5 sao

  @Property({ columnType: 'text', nullable: true })
  comment?: string;

  // --- SỬA Ở ĐÂY: Thêm dấu ? vào createdAt và updatedAt ---
  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt?: Date = new Date();
}