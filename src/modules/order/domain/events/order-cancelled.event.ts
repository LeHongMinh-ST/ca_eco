import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import { OrderId } from "../value-objects/order-id.vo";

/**
 * OrderCancelled domain event
 * Raised when order is cancelled
 */
export class OrderCancelled implements DomainEvent {
  readonly name = "OrderCancelled";
  readonly occurredAt: Date;
  readonly orderId: OrderId;

  constructor(orderId: OrderId) {
    this.orderId = orderId;
    this.occurredAt = new Date();
  }
}

