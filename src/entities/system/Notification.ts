import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { User } from '../user/User';
import { Item } from '../item/Item';

export enum NotificationType {
  MESSAGE = 'MESSAGE',
  WISHLIST_MATCH = 'WISHLIST_MATCH',
  TRANSACTION = 'TRANSACTION',
  RATING = 'RATING',
  SYSTEM = 'SYSTEM',
}

@Entity()
export class Notification {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @Enum(() => NotificationType)
  type!: NotificationType;

  @Property()
  title!: string;

  @Property()
  body!: string;

  @Property({ type: 'json', nullable: true })
  data?: object;

  // SỬA: Thêm dấu ?
  @Property({ default: false })
  isRead?: boolean = false; 

  @ManyToOne(() => Item, { nullable: true })
  relatedItem?: Item;

  @ManyToOne(() => User, { nullable: true })
  relatedUser?: User;

  // SỬA: Thêm dấu ?
  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();
}