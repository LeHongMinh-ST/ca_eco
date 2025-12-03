import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import { OrderId } from "../value-objects/order-id.vo";

/**
 * OrderConfirmed domain event
 * Raised when order is confirmed (inventory successfully decreased)
 */
export class OrderConfirmed implements DomainEvent {
  readonly name = "OrderConfirmed";
  readonly occurredAt: Date;
  readonly orderId: OrderId;

  constructor(orderId: OrderId) {
    this.orderId = orderId;
    this.occurredAt = new Date();
  }
}

