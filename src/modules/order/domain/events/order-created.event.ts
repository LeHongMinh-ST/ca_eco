import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import { OrderId } from "../value-objects/order-id.vo";
import { OrderItem } from "../value-objects/order-item.vo";

/**
 * OrderCreated domain event
 * Raised when a new order is created from cart checkout
 */
export class OrderCreated implements DomainEvent {
  readonly name = "OrderCreated";
  readonly occurredAt: Date;
  readonly orderId: OrderId;
  readonly userId: string;
  readonly items: Array<{
    productId: string;
    productName: string;
    productPrice: number;
    quantity: number;
  }>;
  readonly totalPrice: number;
  readonly sourceCartId?: string; // Original cart ID for clearing after order confirmation

  constructor(
    orderId: OrderId,
    userId: string,
    items: OrderItem[],
    totalPrice: number,
    sourceCartId?: string,
  ) {
    this.orderId = orderId;
    this.userId = userId;
    this.items = items.map((item) => ({
      productId: item.getProductId().getValue(),
      productName: item.getProductName(),
      productPrice: item.getProductPrice(),
      quantity: item.getQuantity(),
    }));
    this.totalPrice = totalPrice;
    this.sourceCartId = sourceCartId;
    this.occurredAt = new Date();
  }
}

