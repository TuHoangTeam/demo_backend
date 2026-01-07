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
  user!: User; // Người nhận thông báo

  @Enum(() => NotificationType)
  type!: NotificationType;

  @Property()
  title!: string;

  @Property()
  body!: string;

  // Lưu dữ liệu bổ sung dạng JSON (PostgreSQL hỗ trợ rất tốt)
  @Property({ type: 'json', nullable: true })
  data?: object;

  @Property({ default: false })
  isRead: boolean = false;

  // Các liên kết optional để tiện điều hướng
  @ManyToOne(() => Item, { nullable: true })
  relatedItem?: Item;

  @ManyToOne(() => User, { nullable: true })
  relatedUser?: User; // Ví dụ: Người đã gửi tin nhắn/đánh giá

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();
}