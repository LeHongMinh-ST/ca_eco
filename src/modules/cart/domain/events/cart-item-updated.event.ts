import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import { CartId } from "../value-objects/cart-id.vo";
import { CartItemId } from "../value-objects/cart-item-id.vo";
import { CartQuantity } from "../value-objects/cart-quantity.vo";

/**
 * CartItemUpdated domain event is raised when cart item quantity is updated
 */
export class CartItemUpdated implements DomainEvent {
  readonly name = "CartItemUpdated";
  readonly occurredAt: Date;
  readonly cartId: CartId;
  readonly cartItemId: CartItemId;
  readonly oldQuantity: CartQuantity;
  readonly newQuantity: CartQuantity;

  constructor(
    cartId: CartId,
    cartItemId: CartItemId,
    oldQuantity: CartQuantity,
    newQuantity: CartQuantity,
  ) {
    this.cartId = cartId;
    this.cartItemId = cartItemId;
    this.oldQuantity = oldQuantity;
    this.newQuantity = newQuantity;
    this.occurredAt = new Date();
  }
}
