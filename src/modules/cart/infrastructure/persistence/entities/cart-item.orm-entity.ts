import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { CartOrmEntity } from "./cart.orm-entity";

/**
 * CartItemOrmEntity represents the database table structure for CartItem
 * This is a persistence model, separate from domain entity
 */
@Entity("cart_items")
export class CartItemOrmEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  cartId: string;

  @Column({ type: "uuid" })
  productId: string;

  @Column({ type: "varchar", length: 255 })
  productName: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  productPrice: number | string;

  @Column({ type: "varchar", length: 2048 })
  productImage: string;

  @Column({ type: "int" })
  quantity: number;

  @ManyToOne(() => CartOrmEntity, (cart) => cart.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "cartId" })
  cart: CartOrmEntity;
}

