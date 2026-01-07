import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection, Enum, OneToOne } from '@mikro-orm/core';
import { User } from '../user/User';
import { Item } from '../item/Item';
// Import Message để dùng làm type, nhưng trong decorator dùng forward reference
import { Message } from './Message'; 

export enum ConversationStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

@Entity()
export class Conversation {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => Item, { nullable: true })
  item?: Item;

  @ManyToOne(() => User)
  user1!: User;

  @ManyToOne(() => User)
  user2!: User;

  @OneToMany(() => Message, message => message.conversation)
  messages = new Collection<Message>(this);

  // SỬA LẠI ĐOẠN NÀY:
  // 1. Xóa 'owner: false'. Conversation sẽ giữ khóa ngoại 'lastMessageId'
  // 2. Dùng () => Message để lazy load, tránh lỗi Circular Dependency
  @OneToOne({ entity: () => Message, nullable: true }) 
  lastMessage?: Message;

  @Property({ nullable: true })
  lastMessageAt?: Date;

  @Enum(() => ConversationStatus)
  status?: ConversationStatus = ConversationStatus.ACTIVE;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt?: Date = new Date();
}