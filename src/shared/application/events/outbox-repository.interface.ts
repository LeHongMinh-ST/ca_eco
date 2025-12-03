/**
 * IOutboxRepository interface defines contract for outbox event persistence
 * Implementation should be provided in infrastructure layer
 */
export interface IOutboxRepository {
  /**
   * Saves an outbox event
   * @param aggregateId - Aggregate root identifier
   * @param eventType - Event type name
   * @param payload - Event payload (serialized event data)
   * @returns Promise that resolves when save is complete
   */
  save(
    aggregateId: string,
    eventType: string,
    payload: Record<string, any>,
  ): Promise<void>;

  /**
   * Finds pending events that need to be processed
   * @param limit - Maximum number of events to return
   * @returns Promise that resolves to array of event IDs
   */
  findPending(limit: number): Promise<string[]>;

  /**
   * Marks an event as processing
   * @param eventId - Event identifier
   * @returns Promise that resolves when update is complete
   */
  markProcessing(eventId: string): Promise<void>;

  /**
   * Marks an event as completed
   * @param eventId - Event identifier
   * @returns Promise that resolves when update is complete
   */
  markCompleted(eventId: string): Promise<void>;

  /**
   * Marks an event as failed
   * @param eventId - Event identifier
   * @param errorMessage - Error message
   * @returns Promise that resolves when update is complete
   */
  markFailed(eventId: string, errorMessage: string): Promise<void>;

  /**
   * Gets event payload by event ID
   * @param eventId - Event identifier
   * @returns Promise that resolves to event payload or undefined if not found
   */
  getEventPayload(eventId: string): Promise<{
    aggregateId: string;
    eventType: string;
    payload: Record<string, any>;
  } | undefined>;
}

export const OutboxRepositoryToken = "IOutboxRepository";

