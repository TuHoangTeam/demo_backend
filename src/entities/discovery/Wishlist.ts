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
  keyword!: string; // Từ khóa tìm kiếm (VD: "Sofa", "Iphone")

  @ManyToOne(() => Category, { nullable: true })
  category?: Category; // Có thể null nếu user muốn tìm trong tất cả danh mục

  @Property({ default: 5000 }) // Mặc định 5km
  maxDistance!: number; 

  @Enum(() => WishlistStatus)
  status: WishlistStatus = WishlistStatus.ACTIVE;

  @Property({ default: true })
  notificationEnabled: boolean = true;

  @Property({ default: 0 })
  matchCount: number = 0; // Đếm số lượng món đồ đã tìm thấy khớp

  // Quan hệ 1-N: Một Wishlist có nhiều kết quả Match
  @OneToMany(() => WishlistMatch, match => match.wishlist)
  matches = new Collection<WishlistMatch>(this);

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}