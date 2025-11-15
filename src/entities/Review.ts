import { Entity, PrimaryKey, Property, ManyToOne, Unique } from '@mikro-orm/core';
import { Product } from './Product'; // Giả định bạn có file này
import { User } from './User'; // Giả định bạn có file này

@Entity()
 // Đảm bảo 1 user chỉ review 1 product 1 lần
export class Review {
  @PrimaryKey()
  id: number;

  @Property({ type: 'smallint', default: 5 })
  rating: number;

  @Property({ type: 'text', nullable: true })
  comment?: string;

  @Property({ type: 'number' })
  productId: number;

  @Property({ type: 'number' })
  userId: number;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}