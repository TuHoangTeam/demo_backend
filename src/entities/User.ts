import { Entity, Property, Opt, PrimaryKey, OneToMany, Collection} from '@mikro-orm/core';
import { Product } from './Product';

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true, hidden: true }) // Username không được trùng
  username!: string;

  @Property({ hidden: true })
  password!: string; // Lưu ý: Trong thực tế cần mã hóa (hash)

  @Property()
  name!: string;

  @Property()
  age?: number;

  // Quan hệ 1-nhiều: 1 User đăng bán nhiều Product
  @OneToMany(() => Product, product => product.owner)
  products = new Collection<Product>(this);

  @Property({ onCreate: () => new Date() })
  createdAt: Date & Opt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();

  // constructor(username: string, password: string, name: string, age?: number) {
  //   this.username = username;
  //   this.password = password;
  //   this.name = name;
  //   this.age = age;
  // }
}