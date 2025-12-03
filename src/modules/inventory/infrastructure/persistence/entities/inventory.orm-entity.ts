import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

/**
 * InventoryOrmEntity represents the database table structure for Inventory
 * This is a persistence model, separate from domain entity
 */
@Entity("inventories")
@Index("IDX_inventories_productId", ["productId"], { unique: true })
export class InventoryOrmEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column({ type: "uuid", unique: true })
  productId: string;

  @Column({ type: "int" })
  quantity: number;

  @Column({ type: "int", default: 10 })
  lowStockThreshold: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

