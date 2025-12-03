import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

/**
 * OutboxEventStatus represents the possible states of an outbox event
 */
export enum OutboxEventStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

/**
 * OutboxEventOrmEntity represents the database table structure for OutboxEvent
 * Stores domain events for reliable asynchronous processing
 */
@Entity("outbox_events")
export class OutboxEventOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  @Index()
  aggregateId: string;

  @Column({ type: "varchar", length: 255 })
  eventType: string;

  @Column({ type: "jsonb" })
  payload: Record<string, any>;

  @Column({
    type: "varchar",
    length: 50,
    default: OutboxEventStatus.PENDING,
  })
  @Index()
  status: OutboxEventStatus;

  @Column({ type: "int", default: 0 })
  retryCount: number;

  @Column({ type: "text", nullable: true })
  errorMessage: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true })
  processedAt: Date | null;
}

