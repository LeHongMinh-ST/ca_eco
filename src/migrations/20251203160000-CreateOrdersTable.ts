import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from "typeorm";

/**
 * Migration to create orders and order_items tables
 * This migration creates the orders and order_items table structure based on OrderOrmEntity and OrderItemOrmEntity
 */
export class CreateOrdersTable20251203160000 implements MigrationInterface {
  /**
   * Creates the orders and order_items tables with all required columns
   * @param queryRunner - QueryRunner instance to execute queries
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create orders table
    await queryRunner.createTable(
      new Table({
        name: "orders",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "userId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "status",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          {
            name: "totalPrice",
            type: "decimal",
            precision: 10,
            scale: 2,
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

    // Create indexes on orders for better query performance
    await queryRunner.createIndex(
      "orders",
      new TableIndex({
        name: "IDX_orders_userId",
        columnNames: ["userId"],
      }),
    );

    await queryRunner.createIndex(
      "orders",
      new TableIndex({
        name: "IDX_orders_status",
        columnNames: ["status"],
      }),
    );

    await queryRunner.createIndex(
      "orders",
      new TableIndex({
        name: "IDX_orders_createdAt",
        columnNames: ["createdAt"],
      }),
    );

    // Create order_items table
    await queryRunner.createTable(
      new Table({
        name: "order_items",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "orderId",
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
            name: "quantity",
            type: "int",
            isNullable: false,
          },
          {
            name: "totalPrice",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create foreign key constraint from order_items to orders
    await queryRunner.createForeignKey(
      "order_items",
      new TableForeignKey({
        columnNames: ["orderId"],
        referencedTableName: "orders",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
        name: "FK_order_items_orderId",
      }),
    );

    // Create indexes on order_items for better query performance
    await queryRunner.createIndex(
      "order_items",
      new TableIndex({
        name: "IDX_order_items_orderId",
        columnNames: ["orderId"],
      }),
    );

    await queryRunner.createIndex(
      "order_items",
      new TableIndex({
        name: "IDX_order_items_productId",
        columnNames: ["productId"],
      }),
    );
  }

  /**
   * Drops the orders and order_items tables
   * @param queryRunner - QueryRunner instance to execute queries
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex("order_items", "IDX_order_items_productId");
    await queryRunner.dropIndex("order_items", "IDX_order_items_orderId");
    await queryRunner.dropIndex("orders", "IDX_orders_createdAt");
    await queryRunner.dropIndex("orders", "IDX_orders_status");
    await queryRunner.dropIndex("orders", "IDX_orders_userId");

    // Drop foreign key
    await queryRunner.dropForeignKey("order_items", "FK_order_items_orderId");

    // Drop tables
    await queryRunner.dropTable("order_items");
    await queryRunner.dropTable("orders");
  }
}

