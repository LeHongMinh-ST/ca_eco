import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import { OrderId } from "../value-objects/order-id.vo";

/**
 * OrderFailed domain event
 * Raised when order fails (inventory check failed or insufficient stock)
 */
export class OrderFailed implements DomainEvent {
  readonly name = "OrderFailed";
  readonly occurredAt: Date;
  readonly orderId: OrderId;
  readonly reason: string;

  constructor(orderId: OrderId, reason: string) {
    this.orderId = orderId;
    this.reason = reason;
    this.occurredAt = new Date();
  }
}

