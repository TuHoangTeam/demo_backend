import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { User } from '../user/User';
import { Item } from '../item/Item';

export enum ReportReason {
  SPAM = 'SPAM',
  INAPPROPRIATE = 'INAPPROPRIATE', // Nội dung không phù hợp
  SCAM = 'SCAM',                   // Lừa đảo
  OTHER = 'OTHER',
}

export enum ReportStatus {
  PENDING = 'PENDING',     // Chờ xử lý
  REVIEWING = 'REVIEWING', // Admin đang xem
  RESOLVED = 'RESOLVED',   // Đã giải quyết (VD: Khóa acc)
  REJECTED = 'REJECTED',   // Báo cáo sai
}

@Entity()
export class Report {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => User)
  reporter!: User; // Người báo cáo

  @ManyToOne(() => User, { nullable: true })
  reportedUser?: User; // Người bị báo cáo (nếu có)

  @ManyToOne(() => Item, { nullable: true })
  reportedItem?: Item; // Món đồ bị báo cáo (nếu có)

  @Enum(() => ReportReason)
  reason!: ReportReason;

  @Property({ columnType: 'text' })
  description!: string;

  @Enum(() => ReportStatus)
  status: ReportStatus = ReportStatus.PENDING;

  @Property({ columnType: 'text', nullable: true })
  adminNote?: string; // Ghi chú của Admin khi xử lý

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}