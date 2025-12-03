import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * ProductOrmEntity represents the database table structure for Product
 * This is a persistence model, separate from domain entity
 */
@Entity("products")
export class ProductOrmEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  // PostgreSQL DECIMAL type returns as string, will be converted to number in mapper
  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number | string;

  @Column({ type: "varchar", length: 2048 })
  image: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
