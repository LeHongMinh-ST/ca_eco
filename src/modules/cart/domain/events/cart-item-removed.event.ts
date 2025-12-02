import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import { CartId } from "../value-objects/cart-id.vo";
import { CartItemId } from "../value-objects/cart-item-id.vo";

/**
 * CartItemRemoved domain event is raised when an item is removed from cart
 */
export class CartItemRemoved implements DomainEvent {
  readonly name = "CartItemRemoved";
  readonly occurredAt: Date;
  readonly cartId: CartId;
  readonly cartItemId: CartItemId;
  readonly productId: string;

  constructor(
    cartId: CartId,
    cartItemId: CartItemId,
    productId: string,
  ) {
    this.cartId = cartId;
    this.cartItemId = cartItemId;
    this.productId = productId;
    this.occurredAt = new Date();
  }
}
