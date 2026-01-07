import { Entity, PrimaryKey, Property, ManyToOne, Enum, Collection, OneToMany } from '@mikro-orm/core';
import { User } from '../user/User';
import { Category } from '../item/Category';
import { WishlistMatch } from './WishlistMatch';

export enum WishlistStatus {
  ACTIVE = 'ACTIVE',       // Đang tìm kiếm
  INACTIVE = 'INACTIVE',   // Tạm dừng
  FULFILLED = 'FULFILLED', // Đã tìm được
}

@Entity()
export class Wishlist {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @Property()
  keyword!: string;

  @ManyToOne(() => Category, { nullable: true })
  category?: Category;

  @Property({ default: 5000 })
  maxDistance?: number = 5000; // Thêm ?

  @Enum(() => WishlistStatus)
  status: WishlistStatus = WishlistStatus.ACTIVE;

  @Property({ default: true })
  notificationEnabled?: boolean = true; // Thêm ?

  @Property({ default: 0 })
  matchCount?: number = 0; // Thêm ?

  @OneToMany(() => WishlistMatch, match => match.wishlist)
  matches = new Collection<WishlistMatch>(this);

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date(); // Thêm ?

  @Property({ onUpdate: () => new Date() })
  updatedAt?: Date = new Date(); // Thêm ?
}