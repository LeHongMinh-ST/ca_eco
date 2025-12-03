import { Injectable, Inject, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import {
  type IOutboxRepository,
  OutboxRepositoryToken,
} from "../../application/events/outbox-repository.interface";
import { EventHandlersRegistry } from "../../application/events/event-handlers-registry";
import { DomainEvent } from "../../domain/interfaces/domain-event.interface";

/**
 * OutboxProcessor processes pending events from outbox table/collection
 * Runs as a background job to dispatch events to registered handlers
 */
@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);
  private readonly BATCH_SIZE = 10; // Process 10 events at a time

  constructor(
    @Inject(OutboxRepositoryToken)
    private readonly outboxRepository: IOutboxRepository,
    private readonly eventHandlersRegistry: EventHandlersRegistry,
  ) {}

  /**
   * Processes pending events from outbox
   * Runs every 5 seconds to check for new events
   */
  @Cron(CronExpression.EVERY_5_SECONDS)
  async processPendingEvents(): Promise<void> {
    try {
      // Get pending event IDs
      const pendingEventIds = await this.outboxRepository.findPending(
        this.BATCH_SIZE,
      );

      if (pendingEventIds.length === 0) {
        return; // No pending events
      }

      this.logger.debug(
        `Processing ${pendingEventIds.length} pending events`,
      );

      // Process each event
      for (const eventId of pendingEventIds) {
        await this.processEvent(eventId);
      }
    } catch (error) {
      this.logger.error(
        `Error processing pending events: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Processes a single event
   * @param eventId - Event identifier
   */
  private async processEvent(eventId: string): Promise<void> {
    try {
      // Mark event as processing
      await this.outboxRepository.markProcessing(eventId);

      // Get event payload
      const eventData = await this.outboxRepository.getEventPayload(eventId);
      if (!eventData) {
        this.logger.warn(`Event ${eventId} not found`);
        return;
      }

      // Reconstruct domain event from payload
      const event = this.reconstructEvent(eventData);

      // Get handlers for this event type
      const handlers = this.eventHandlersRegistry.getHandlers(
        eventData.eventType,
      );

      if (handlers.length === 0) {
        this.logger.warn(
          `No handlers registered for event type: ${eventData.eventType}`,
        );
        // Mark as completed even if no handlers (event was processed, just no handlers)
        await this.outboxRepository.markCompleted(eventId);
        return;
      }

      // Dispatch to all handlers
      let hasError = false;
      let errorMessage = "";

      for (const handler of handlers) {
        try {
          await handler.handle(event);
        } catch (error) {
          hasError = true;
          errorMessage = error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Error handling event ${eventId} with handler ${handler.constructor.name}: ${errorMessage}`,
            error instanceof Error ? error.stack : undefined,
          );
        }
      }

      // Update event status
      if (hasError) {
        await this.outboxRepository.markFailed(eventId, errorMessage);
      } else {
        await this.outboxRepository.markCompleted(eventId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error processing event ${eventId}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      await this.outboxRepository.markFailed(eventId, errorMessage);
    }
  }

  /**
   * Reconstructs domain event from payload
   * This is a simplified reconstruction - in production, you might want
   * to use a more sophisticated deserialization mechanism
   */
  private reconstructEvent(eventData: {
    aggregateId: string;
    eventType: string;
    payload: Record<string, any>;
  }): DomainEvent {
    // Create a simple event object that implements DomainEvent interface
    // Handlers will need to check event type and cast appropriately
    return {
      name: eventData.eventType,
      occurredAt: new Date(eventData.payload.occurredAt),
      ...eventData.payload,
    } as DomainEvent;
  }
}

