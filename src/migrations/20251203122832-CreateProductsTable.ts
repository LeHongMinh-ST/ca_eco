import { MigrationInterface, QueryRunner, Table } from "typeorm";

/**
 * Migration to create products table
 * This migration creates the products table structure based on ProductOrmEntity
 */
export class CreateProductsTable20251203122832 implements MigrationInterface {
  /**
   * Creates the products table with all required columns
   * @param queryRunner - QueryRunner instance to execute queries
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "products",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "name",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "price",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: "image",
            type: "varchar",
            length: "2048",
            isNullable: false,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
        ],
      }),
      true,
    );
  }

  /**
   * Drops the products table
   * @param queryRunner - QueryRunner instance to execute queries
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("products");
  }
}
