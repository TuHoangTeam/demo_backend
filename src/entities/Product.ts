import { Entity, PrimaryKey, Property, Opt } from '@mikro-orm/core';

@Entity()
export class Product {
  @PrimaryKey()
  id!: number;

  @Property()
  createdAt: Date & Opt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();

  @Property()
  name: string;

  @Property()
  price: number;

  @Property({ nullable: true })
  description?: string;

  constructor(name: string, price: number, description?: string) {
    this.name = name;
    this.price = price;
    this.description = description;
  }
}
