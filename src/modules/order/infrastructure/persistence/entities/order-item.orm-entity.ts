import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { OrderOrmEntity } from "./order.orm-entity";

/**
 * OrderItemOrmEntity represents the database table structure for OrderItem
 * This is a persistence model, separate from domain entity
 */
@Entity("order_items")
export class OrderItemOrmEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  orderId: string;

  @Column({ type: "uuid" })
  productId: string;

  @Column({ type: "varchar", length: 255 })
  productName: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  productPrice: number | string;

  @Column({ type: "int" })
  quantity: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  totalPrice: number | string;

  @ManyToOne(() => OrderOrmEntity, (order) => order.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "orderId" })
  order: OrderOrmEntity;
}

