import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { User } from './User';
import { Product } from './Product';

@Entity()
export class Review {
  @PrimaryKey()
  id!: number;

  @Property()
  rating!: number;

  @Property({ columnType: 'text' })
  comment!: string;

  @ManyToOne(() => User)
  userId!: User;

  @ManyToOne(() => Product)
  productId!: Product;

  // SỬA Ở ĐÂY: Thêm dấu ? vào sau createdAt
  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();
}