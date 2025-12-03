import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import { OrderId } from "../value-objects/order-id.vo";
import { OrderStatusEnum } from "../value-objects/order-status.vo";

/**
 * OrderStatusChanged domain event
 * Raised when order status changes
 */
export class OrderStatusChanged implements DomainEvent {
  readonly name = "OrderStatusChanged";
  readonly occurredAt: Date;
  readonly orderId: OrderId;
  readonly oldStatus: OrderStatusEnum;
  readonly newStatus: OrderStatusEnum;

  constructor(
    orderId: OrderId,
    oldStatus: OrderStatusEnum,
    newStatus: OrderStatusEnum,
  ) {
    this.orderId = orderId;
    this.oldStatus = oldStatus;
    this.newStatus = newStatus;
    this.occurredAt = new Date();
  }
}

