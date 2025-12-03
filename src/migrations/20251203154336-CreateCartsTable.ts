import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from "typeorm";

/**
 * Migration to create carts and cart_items tables
 * This migration creates the carts and cart_items table structure based on CartOrmEntity and CartItemOrmEntity
 */
export class CreateCartsTable20251203154336 implements MigrationInterface {
  /**
   * Creates the carts and cart_items tables with all required columns
   * @param queryRunner - QueryRunner instance to execute queries
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create carts table
    await queryRunner.createTable(
      new Table({
        name: "carts",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "userId",
            type: "uuid",
            isUnique: true,
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

    // Create index on userId for better query performance
    await queryRunner.createIndex(
      "carts",
      new TableIndex({
        name: "IDX_carts_userId",
        columnNames: ["userId"],
      }),
    );

    // Create cart_items table
    await queryRunner.createTable(
      new Table({
        name: "cart_items",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "cartId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "productId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "productName",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "productPrice",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: "productImage",
            type: "varchar",
            length: "2048",
            isNullable: false,
          },
          {
            name: "quantity",
            type: "int",
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create foreign key constraint from cart_items to carts
    await queryRunner.createForeignKey(
      "cart_items",
      new TableForeignKey({
        columnNames: ["cartId"],
        referencedTableName: "carts",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        name: "FK_cart_items_cartId",
      }),
    );

    // Create indexes on cart_items for better query performance
    await queryRunner.createIndex(
      "cart_items",
      new TableIndex({
        name: "IDX_cart_items_cartId",
        columnNames: ["cartId"],
      }),
    );

    await queryRunner.createIndex(
      "cart_items",
      new TableIndex({
        name: "IDX_cart_items_productId",
        columnNames: ["productId"],
      }),
    );
  }

  /**
   * Drops the carts and cart_items tables
   * @param queryRunner - QueryRunner instance to execute queries
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex("cart_items", "IDX_cart_items_productId");
    await queryRunner.dropIndex("cart_items", "IDX_cart_items_cartId");
    await queryRunner.dropIndex("carts", "IDX_carts_userId");

    // Drop foreign key
    await queryRunner.dropForeignKey("cart_items", "FK_cart_items_cartId");

    // Drop tables
    await queryRunner.dropTable("cart_items");
    await queryRunner.dropTable("carts");
  }
}

