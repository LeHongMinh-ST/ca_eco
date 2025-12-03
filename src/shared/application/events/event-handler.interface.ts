import { DomainEvent } from "../../domain/interfaces/domain-event.interface";

/**
 * EventHandler interface defines contract for handling domain events
 * Event handlers should implement this interface to process specific event types
 */
export interface IEventHandler {
  /**
   * Handles a domain event
   * @param event - Domain event to handle
   * @returns Promise that resolves when handling is complete
   */
  handle(event: DomainEvent): Promise<void>;
}

