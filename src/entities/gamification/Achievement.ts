import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';

export enum AchievementType {
  CO2_SAVED = 'CO2_SAVED',
  ITEMS_GIVEN = 'ITEMS_GIVEN',
  ITEMS_RECEIVED = 'ITEMS_RECEIVED',
  RATING = 'RATING',
  STREAK = 'STREAK',
}

export enum AchievementStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity()
export class Achievement {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  name!: string;

  @Property()
  description!: string;

  @Property()
  icon!: string; // URL icon hoặc tên icon

  @Enum(() => AchievementType)
  type!: AchievementType;

  @Property()
  requirement!: number; // Ví dụ: Cần 10 món đồ để đạt được

  @Property()
  rewardPoints!: number; // Điểm thưởng khi đạt được

  @Enum(() => AchievementStatus)
  status: AchievementStatus = AchievementStatus.ACTIVE;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}