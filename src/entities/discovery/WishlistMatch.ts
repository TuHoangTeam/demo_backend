import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Wishlist } from './Wishlist';
import { Item } from '../item/Item';

@Entity()
export class WishlistMatch {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => Wishlist)
  wishlist!: Wishlist;

  @ManyToOne(() => Item)
  item!: Item;

  @Property()
  matchScore!: number; // Điểm khớp 0-100

  @Property({ default: false })
  notified: boolean = false;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();
}