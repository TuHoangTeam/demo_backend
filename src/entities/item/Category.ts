import { Entity, PrimaryKey, Property, Enum, OneToMany, Collection } from '@mikro-orm/core';
import { Item } from './Item';

export enum CategoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity()
export class Category {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  nameEn?: string;

  @Property({ nullable: true })
  icon?: string;

  @Property()
  color!: string;

  @Property({ type: 'float' })
  avgCO2PerKg!: number;

  @Enum(() => CategoryStatus)
  status?: CategoryStatus = CategoryStatus.ACTIVE;

  // SỬA: Thêm dấu ?
  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt?: Date = new Date();

  // Quan hệ 1-N: Một danh mục có nhiều món đồ
  @OneToMany(() => Item, item => item.category)
  items = new Collection<Item>(this);
}