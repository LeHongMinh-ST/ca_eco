import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

/**
 * Migration to add sourceCartId column to orders table
 * This column stores the original cart ID that created the order
 * Used for clearing cart after order confirmation
 */
export class AddSourceCartIdToOrders20251203170000
  implements MigrationInterface
{
  /**
   * Adds sourceCartId column to orders table
   * @param queryRunner - QueryRunner instance to execute queries
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "orders",
      new TableColumn({
        name: "sourceCartId",
        type: "uuid",
        isNullable: true, // Nullable because orders can be created without cart
      }),
    );
  }

  /**
   * Removes sourceCartId column from orders table
   * @param queryRunner - QueryRunner instance to execute queries
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("orders", "sourceCartId");
  }
}

