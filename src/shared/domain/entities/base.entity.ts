/**
 * BaseEntity provides shared behaviour for domain aggregates
 * - Stores identifier value object
 * - Captures domain events for later dispatch
 */
import { DomainEvent } from "../interfaces/domain-event.interface";
import { BaseId } from "../value-objects/base-id.vo";

export abstract class BaseEntity<TId extends BaseId> {
  private readonly id: TId;
  private domainEvents: DomainEvent[] = [];

  protected constructor(id: TId) {
    this.id = id;
  }

  /**
   * Returns entity identifier
   */
  getId(): TId {
    return this.id;
  }

  /**
   * Collects and clears recorded domain events
   * Should be called by infrastructure layer after persistence
   */
  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }

  /**
   * Records domain event for later publication
   */
  protected recordEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }
}
