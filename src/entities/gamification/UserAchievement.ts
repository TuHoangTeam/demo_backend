import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { User } from '../user/User';
import { Achievement } from './Achievement';

@Entity()
export class UserAchievement {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Achievement)
  achievement!: Achievement;

  @Property({ default: 0 })
  progress?: number = 0;

  @Property({ default: false })
  isCompleted?: boolean = false;

  @Property({ nullable: true })
  completedAt?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt?: Date = new Date();
}