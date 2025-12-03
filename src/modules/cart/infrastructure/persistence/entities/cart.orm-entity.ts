import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { CartItemOrmEntity } from "./cart-item.orm-entity";

/**
 * CartOrmEntity represents the database table structure for Cart
 * This is a persistence model, separate from domain entity
 */
@Entity("carts")
export class CartOrmEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  userId: string;

  @OneToMany(() => CartItemOrmEntity, (item) => item.cart, {
    cascade: true,
    eager: true,
  })
  items: CartItemOrmEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

