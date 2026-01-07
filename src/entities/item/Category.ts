import { Entity, PrimaryKey, Property, Enum, Collection, OneToMany } from '@mikro-orm/core';
import { Item } from './Item'; // Đổi tên Product thành Item sau này nhé

export enum CategoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity()
export class Category {
  // Theo tài liệu dùng UUID string
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  nameEn?: string; // Tên tiếng Anh (optional)

  @Property({ nullable: true })
  icon?: string; // Tên icon hoặc URL icon

  @Property()
  color!: string; // Mã màu Hex (ví dụ: #FF5733)

  @Property({ type: 'float' })
  avgCO2PerKg!: number; // CO2 trung bình tiết kiệm được trên mỗi kg

  @Enum(() => CategoryStatus)
  status: CategoryStatus = CategoryStatus.ACTIVE;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  // Quan hệ 1-N: Một danh mục có nhiều món đồ
  @OneToMany(() => Item, item => item.category)
  items = new Collection<Item>(this);
}