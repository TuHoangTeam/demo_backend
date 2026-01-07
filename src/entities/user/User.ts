import { Entity, PrimaryKey, Property, OneToMany, Collection, Enum } from '@mikro-orm/core';
import { Item } from '../item/Item';
import { Transaction } from '../commerce/Transaction';
import { Wishlist } from '../discovery/Wishlist';
import { Favorite } from '../item/Favorite';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

@Entity()
export class User {
  // Nếu bạn đang dùng id number, có thể giữ nguyên. 
  // Nhưng tài liệu yêu cầu UUID, tôi sẽ để code UUID ở đây.
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ unique: true })
  email!: string;

  // Giữ lại username nếu hệ thống cũ cần, tài liệu mới dùng email là chính
  @Property({ unique: true, nullable: true }) 
  username?: string;

  @Property({ hidden: true })
  password!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  phone?: string;

  @Property({ nullable: true })
  avatar?: string;

  @Property({ columnType: 'text', nullable: true })
  bio?: string;

  // --- Location Info ---
  @Property({ nullable: true })
  location?: string; // Địa chỉ text (VD: TP. Hồ Chí Minh)

  @Property({ type: 'double', nullable: true })
  latitude?: number;

  @Property({ type: 'double', nullable: true })
  longitude?: number;

  // --- Gamification & Stats ---
  @Property({ default: 15 })
  gPoints?: number = 15; 

  @Property({ type: 'float', default: 0 })
  totalCO2Saved?: number = 0;

  @Property({ default: 0 })
  totalItemsGiven?: number = 0;

  @Property({ default: 0 })
  totalItemsReceived?: number = 0;

  @Property({ type: 'float', default: 0 })
  rating?: number = 0;

  @Property({ default: 0 })
  totalRatings?: number = 0;

  @Enum(() => UserStatus)
  status: UserStatus = UserStatus.ACTIVE;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt?: Date = new Date();

  @OneToMany(() => Transaction, t => t.giver)
  givenTransactions = new Collection<Transaction>(this);

  @OneToMany(() => Transaction, t => t.receiver)
  receivedTransactions = new Collection<Transaction>(this);

  @OneToMany(() => Wishlist, wishlist => wishlist.user)
  wishlists = new Collection<Wishlist>(this);

  @OneToMany(() => Favorite, fav => fav.user)
  favorites = new Collection<Favorite>(this);

  @OneToMany(() => Item, item => item.owner)
  items = new Collection<Item>(this);
}