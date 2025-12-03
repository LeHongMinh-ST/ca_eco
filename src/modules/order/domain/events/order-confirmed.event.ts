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
  readonly sourceCartId?: string; // Original cart ID for clearing after confirmation

  constructor(orderId: OrderId, sourceCartId?: string) {
    this.orderId = orderId;
    this.sourceCartId = sourceCartId;
    this.occurredAt = new Date();
  }
}

