import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

/**
 * Migration to create outbox_events table
 * This table stores domain events for reliable asynchronous processing
 */
export class CreateOutboxEventsTable20251203150000 implements MigrationInterface {
  /**
   * Creates the outbox_events table with all required columns
   * @param queryRunner - QueryRunner instance to execute queries
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "outbox_events",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          {
            name: "aggregateId",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "eventType",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "payload",
            type: "jsonb",
            isNullable: false,
          },
          {
            name: "status",
            type: "varchar",
            length: "50",
            isNullable: false,
            default: "'PENDING'",
          },
          {
            name: "retryCount",
            type: "int",
            default: 0,
            isNullable: false,
          },
          {
            name: "errorMessage",
            type: "text",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "processedAt",
            type: "timestamp",
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create index on status and createdAt for efficient querying
    await queryRunner.createIndex(
      "outbox_events",
      new TableIndex({
        name: "IDX_outbox_events_status_created",
        columnNames: ["status", "createdAt"],
      }),
    );

    // Create index on aggregateId for aggregate event queries
    await queryRunner.createIndex(
      "outbox_events",
      new TableIndex({
        name: "IDX_outbox_events_aggregate_id",
        columnNames: ["aggregateId"],
      }),
    );
  }

  /**
   * Drops the outbox_events table
   * @param queryRunner - QueryRunner instance to execute queries
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("outbox_events", "IDX_outbox_events_aggregate_id");
    await queryRunner.dropIndex("outbox_events", "IDX_outbox_events_status_created");
    await queryRunner.dropTable("outbox_events");
  }
}

