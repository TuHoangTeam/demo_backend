import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { User } from './User';

@Entity()
export class Product {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  // Dùng columnType: 'text' để lưu mô tả dài
  @Property({ columnType: 'text' })
  description?: string;

  @Property()
  status!: string; 

  @Property()
  price!: number;

  @Property()
  available: boolean = true;

  @ManyToOne(() => User)
  owner!: User;

  // FIX QUAN TRỌNG: Thêm dấu ? để TypeScript hiểu đây là optional khi tạo mới
  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  // FIX QUAN TRỌNG: Thêm dấu ?
  @Property({ onUpdate: () => new Date() })
  updatedAt?: Date = new Date();
}