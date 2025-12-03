import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

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
 * OutboxEventDocument represents MongoDB document structure for OutboxEvent
 */
export type OutboxEventDocument = OutboxEventMongoEntity & Document;

/**
 * OutboxEventMongoEntity represents the MongoDB collection structure for OutboxEvent
 * Stores domain events for reliable asynchronous processing
 */
@Schema({
  collection: "outbox_events",
  timestamps: true,
  versionKey: false,
})
export class OutboxEventMongoEntity {
  @Prop({ type: String, required: true, unique: true })
  _id: string; // UUID as string

  @Prop({ type: String, required: true, index: true })
  aggregateId: string;

  @Prop({ type: String, required: true })
  eventType: string;

  @Prop({ type: Object, required: true })
  payload: Record<string, any>;

  @Prop({
    type: String,
    enum: Object.values(OutboxEventStatus),
    default: OutboxEventStatus.PENDING,
    index: true,
  })
  status: OutboxEventStatus;

  @Prop({ type: Number, default: 0 })
  retryCount: number;

  @Prop({ type: String, required: false })
  errorMessage?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, required: false })
  processedAt?: Date;
}

/**
 * Mongoose schema factory for OutboxEventMongoEntity
 */
export const OutboxEventSchema = SchemaFactory.createForClass(
  OutboxEventMongoEntity,
);

// Create compound index on status and createdAt for efficient querying
OutboxEventSchema.index({ status: 1, createdAt: 1 });

// Create index on aggregateId for aggregate event queries
OutboxEventSchema.index({ aggregateId: 1 });

