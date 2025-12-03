import { Injectable, Inject } from "@nestjs/common";
import { IDomainEventDispatcher } from "../../application/events/domain-event-dispatcher.interface";
import { DomainEvent } from "../../domain/interfaces/domain-event.interface";
import {
  type IOutboxRepository,
  OutboxRepositoryToken,
} from "../../application/events/outbox-repository.interface";

/**
 * OutboxEventDispatcher implements IDomainEventDispatcher
 * Saves domain events to outbox table/collection for reliable asynchronous processing
 */
@Injectable()
export class OutboxEventDispatcher implements IDomainEventDispatcher {
  constructor(
    @Inject(OutboxRepositoryToken)
    private readonly outboxRepository: IOutboxRepository,
  ) {}

  /**
   * Dispatches a domain event to outbox
   * Serializes event and saves to outbox repository
   */
  async dispatch(event: DomainEvent): Promise<void> {
    // Extract aggregate ID from event
    // Domain events should have getAggregateId() method or similar
    const aggregateId = this.extractAggregateId(event);

    // Serialize event to JSON payload
    const payload = this.serializeEvent(event);

    // Save to outbox repository
    await this.outboxRepository.save(
      aggregateId,
      event.name,
      payload,
    );
  }

  /**
   * Extracts aggregate ID from domain event
   * Checks for common patterns: getAggregateId(), aggregateId, id properties
   */
  private extractAggregateId(event: DomainEvent): string {
    // Try getAggregateId method if available
    if (typeof (event as any).getAggregateId === "function") {
      return (event as any).getAggregateId();
    }

    // Try common property names
    if ((event as any).aggregateId) {
      const aggregateId = (event as any).aggregateId;
      return typeof aggregateId === "string"
        ? aggregateId
        : aggregateId.getValue();
    }

    if ((event as any).productId) {
      const productId = (event as any).productId;
      return typeof productId === "string"
        ? productId
        : productId.getValue();
    }

    if ((event as any).cartId) {
      const cartId = (event as any).cartId;
      return typeof cartId === "string" ? cartId : cartId.getValue();
    }

    if ((event as any).userId) {
      const userId = (event as any).userId;
      return typeof userId === "string" ? userId : userId.getValue();
    }

    // Fallback: use event name as aggregate ID (not ideal but safe)
    return event.name;
  }

  /**
   * Serializes domain event to JSON payload
   */
  private serializeEvent(event: DomainEvent): Record<string, any> {
    const payload: Record<string, any> = {
      name: event.name,
      occurredAt: event.occurredAt.toISOString(),
    };

    // Serialize all properties of the event
    for (const key in event) {
      if (key !== "name" && key !== "occurredAt") {
        const value = (event as any)[key];
        payload[key] = this.serializeValue(value);
      }
    }

    return payload;
  }

  /**
   * Serializes a value to JSON-safe format
   */
  private serializeValue(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    // Handle value objects with getValue() method
    if (
      typeof value === "object" &&
      value !== null &&
      "getValue" in value &&
      typeof (value as { getValue: () => unknown }).getValue === "function"
    ) {
      return (value as { getValue: () => unknown }).getValue();
    }

    // Handle Date objects
    if (value instanceof Date) {
      return value.toISOString();
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map((item) => this.serializeValue(item));
    }

    // Handle objects
    if (typeof value === "object" && value !== null) {
      const serialized: Record<string, unknown> = {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          serialized[key] = this.serializeValue(
            (value as Record<string, unknown>)[key],
          );
        }
      }
      return serialized;
    }

    // Primitive types
    return value;
  }
}

