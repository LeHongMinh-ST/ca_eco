import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IOutboxRepository } from "../../application/events/outbox-repository.interface";
import {
  OutboxEventOrmEntity,
  OutboxEventStatus,
} from "./outbox-event.orm-entity";

/**
 * OutboxRepository implements IOutboxRepository using TypeORM
 * Handles persistence of outbox events in PostgreSQL
 */
@Injectable()
export class OutboxRepository implements IOutboxRepository {
  constructor(
    @InjectRepository(OutboxEventOrmEntity)
    private readonly ormRepository: Repository<OutboxEventOrmEntity>,
  ) {}

  /**
   * Saves an outbox event
   */
  async save(
    aggregateId: string,
    eventType: string,
    payload: Record<string, any>,
  ): Promise<void> {
    const outboxEvent = new OutboxEventOrmEntity();
    outboxEvent.aggregateId = aggregateId;
    outboxEvent.eventType = eventType;
    outboxEvent.payload = payload;
    outboxEvent.status = OutboxEventStatus.PENDING;
    outboxEvent.retryCount = 0;

    await this.ormRepository.save(outboxEvent);
  }

  /**
   * Finds pending events that need to be processed
   */
  async findPending(limit: number): Promise<string[]> {
    const events = await this.ormRepository.find({
      where: { status: OutboxEventStatus.PENDING },
      order: { createdAt: "ASC" },
      take: limit,
    });

    return events.map((event) => event.id);
  }

  /**
   * Marks an event as processing
   */
  async markProcessing(eventId: string): Promise<void> {
    await this.ormRepository.update(eventId, {
      status: OutboxEventStatus.PROCESSING,
    });
  }

  /**
   * Marks an event as completed
   */
  async markCompleted(eventId: string): Promise<void> {
    await this.ormRepository.update(eventId, {
      status: OutboxEventStatus.COMPLETED,
      processedAt: new Date(),
    });
  }

  /**
   * Marks an event as failed
   */
  async markFailed(eventId: string, errorMessage: string): Promise<void> {
    await this.ormRepository.update(eventId, {
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
    const event = await this.ormRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      return undefined;
    }

    return {
      aggregateId: event.aggregateId,
      eventType: event.eventType,
      payload: event.payload,
    };
  }
}

