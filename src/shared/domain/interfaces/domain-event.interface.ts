/**
 * DomainEvent defines a basic contract for domain layer events
 */
export interface DomainEvent {
  readonly name: string;
  readonly occurredAt: Date;
}
