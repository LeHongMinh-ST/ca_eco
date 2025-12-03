import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IOutboxRepository } from "../../application/events/outbox-repository.interface";
import {
  OutboxEventMongoEntity,
  OutboxEventDocument,
  OutboxEventStatus,
} from "./outbox-event.schema";

/**
 * OutboxMongoRepository implements IOutboxRepository using Mongoose
 * Handles persistence of outbox events in MongoDB
 */
@Injectable()
export class OutboxMongoRepository implements IOutboxRepository {
  constructor(
    @InjectModel(OutboxEventMongoEntity.name)
    private readonly mongoModel: Model<OutboxEventDocument>,
  ) {}

  /**
   * Saves an outbox event
   */
  async save(
    aggregateId: string,
    eventType: string,
    payload: Record<string, any>,
  ): Promise<void> {
    const eventId = crypto.randomUUID();
    const outboxEvent = new this.mongoModel({
      _id: eventId,
      aggregateId,
      eventType,
      payload,
      status: OutboxEventStatus.PENDING,
      retryCount: 0,
    });

    await outboxEvent.save();
  }

  /**
   * Finds pending events that need to be processed
   */
  async findPending(limit: number): Promise<string[]> {
    const events = await this.mongoModel
      .find({ status: OutboxEventStatus.PENDING })
      .sort({ createdAt: 1 })
      .limit(limit)
      .exec();

    const eventIds: string[] = [];
    for (const event of events) {
      eventIds.push(event._id);
    }
    return eventIds;
  }

  /**
   * Marks an event as processing
   */
  async markProcessing(eventId: string): Promise<void> {
    await this.mongoModel.findByIdAndUpdate(eventId, {
      status: OutboxEventStatus.PROCESSING,
    });
  }

  /**
   * Marks an event as completed
   */
  async markCompleted(eventId: string): Promise<void> {
    await this.mongoModel.findByIdAndUpdate(eventId, {
      status: OutboxEventStatus.COMPLETED,
      processedAt: new Date(),
    });
  }

  /**
   * Marks an event as failed
   */
  async markFailed(eventId: string, errorMessage: string): Promise<void> {
    await this.mongoModel.findByIdAndUpdate(eventId, {
      status: OutboxEventStatus.FAILED,
      errorMessage,
      processedAt: new Date(),
    });
  }

  /**
   * Gets event payload by event ID
   */
  async getEventPayload(eventId: string): Promise<{
    aggregateId: string;
    eventType: string;
    payload: Record<string, any>;
  } | undefined> {
    const event = await this.mongoModel.findById(eventId).exec();

    if (!event) {
      return undefined;
    }

    const result: {
      aggregateId: string;
      eventType: string;
      payload: Record<string, any>;
    } = {
      aggregateId: event.aggregateId,
      eventType: event.eventType,
      payload: event.payload as Record<string, any>,
    };
    return result;
  }
}

