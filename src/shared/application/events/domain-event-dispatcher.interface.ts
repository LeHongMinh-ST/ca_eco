import { DomainEvent } from "../../domain/interfaces/domain-event.interface";

/**
 * DomainEventDispatcher interface defines contract for dispatching domain events
 * Implementation should save events to outbox for reliable processing
 */
export interface IDomainEventDispatcher {
  /**
   * Dispatches a domain event to outbox
   * Should save event to outbox table/collection in the same transaction
   * @param event - Domain event to dispatch
   * @returns Promise that resolves when dispatch is complete
   */
  dispatch(event: DomainEvent): Promise<void>;
}

export const DomainEventDispatcherToken = "IDomainEventDispatcher";

