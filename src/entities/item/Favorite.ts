import { Entity, PrimaryKey, Property, ManyToOne, Unique } from '@mikro-orm/core';
import { User } from '../user/User';
import { Item } from './Item';

@Entity()
@Unique({ properties: ['user', 'item'] })
export class Favorite {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Item)
  item!: Item;

  // SỬA: Thêm dấu ?
  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();
}