import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { User } from '../user/User';
import { Item } from '../item/Item';

export enum ReportReason {
  SPAM = 'SPAM',
  INAPPROPRIATE = 'INAPPROPRIATE',
  SCAM = 'SCAM',
  OTHER = 'OTHER',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

@Entity()
export class Report {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => User)
  reporter!: User;

  @ManyToOne(() => User, { nullable: true })
  reportedUser?: User;

  @ManyToOne(() => Item, { nullable: true })
  reportedItem?: Item;

  @Enum(() => ReportReason)
  reason!: ReportReason;

  @Property({ columnType: 'text' })
  description!: string;

  // SỬA: Thêm dấu ?
  @Enum(() => ReportStatus)
  status?: ReportStatus = ReportStatus.PENDING;

  @Property({ columnType: 'text', nullable: true })
  adminNote?: string;

  // SỬA: Thêm dấu ?
  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt?: Date = new Date();
}