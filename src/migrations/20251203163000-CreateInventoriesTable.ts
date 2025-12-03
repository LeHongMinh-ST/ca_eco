import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
} from "typeorm";

/**
 * Migration to create inventories table
 * This migration creates the inventories table structure based on InventoryOrmEntity
 */
export class CreateInventoriesTable20251203163000 implements MigrationInterface {
  /**
   * Creates the inventories table with all required columns
   * @param queryRunner - QueryRunner instance to execute queries
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create inventories table
    await queryRunner.createTable(
      new Table({
        name: "inventories",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "productId",
            type: "uuid",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "quantity",
            type: "int",
            isNullable: false,
            default: 0,
          },
          {
            name: "lowStockThreshold",
            type: "int",
            isNullable: false,
            default: 10,
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

    // Create unique index on productId for better query performance and data integrity
    await queryRunner.createIndex(
      "inventories",
      new TableIndex({
        name: "IDX_inventories_productId",
        columnNames: ["productId"],
        isUnique: true,
      }),
    );
  }

  /**
   * Drops the inventories table
   * @param queryRunner - QueryRunner instance to execute queries
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.dropIndex("inventories", "IDX_inventories_productId");

    // Drop table
    await queryRunner.dropTable("inventories");
  }
}

