import { Entity, PrimaryKey, Property, ManyToOne, Enum, Collection, OneToMany } from '@mikro-orm/core';
import { User } from '../user/User';
import { Category } from './Category';

export enum ItemCondition {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

export enum ItemType {
  GIVE = 'GIVE',
  EXCHANGE = 'EXCHANGE',
}

export enum ItemStatus {
  AVAILABLE = 'AVAILABLE',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  DELETED = 'DELETED',
}

@Entity()
export class Item {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => User)
  owner!: User;

  @Property()
  title!: string;

  @Property({ columnType: 'text' })
  description!: string;

  @ManyToOne(() => Category)
  category!: Category;

  @Enum(() => ItemCondition)
  condition!: ItemCondition;

  @Enum(() => ItemType)
  type!: ItemType;

  @Property({ type: 'json', nullable: true })
  images?: string[] = []; // Array URL ảnh

  @Property()
  location!: string;

  @Property({ type: 'double' })
  latitude!: number;

  @Property({ type: 'double' })
  longitude!: number;

  // SỬA: Thêm dấu ? vào các trường có default
  @Enum(() => ItemStatus)
  status?: ItemStatus = ItemStatus.AVAILABLE;

  @Property({ default: 0 })
  views?: number = 0;

  @Property({ default: 0 })
  favorites?: number = 0;

  @Property({ type: 'float', default: 0 })
  estimatedCO2?: number = 0;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt?: Date = new Date();
}