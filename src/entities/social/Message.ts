import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { Conversation } from './Conversation';
import { User } from '../user/User';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  SYSTEM = 'SYSTEM',
}

@Entity()
export class Message {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => Conversation)
  conversation!: Conversation;

  @ManyToOne(() => User)
  sender!: User;

  @Property({ columnType: 'text' })
  content!: string;

  @Enum(() => MessageType)
  type: MessageType = MessageType.TEXT;

  @Property()
  isRead: boolean = false;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt?: Date = new Date();
}