import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { OrderItemOrmEntity } from "./order-item.orm-entity";

/**
 * OrderOrmEntity represents the database table structure for Order
 * This is a persistence model, separate from domain entity
 */
@Entity("orders")
export class OrderOrmEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  userId: string;

  @Column({ type: "varchar", length: 50 })
  status: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  totalPrice: number | string;

  @OneToMany(() => OrderItemOrmEntity, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItemOrmEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

