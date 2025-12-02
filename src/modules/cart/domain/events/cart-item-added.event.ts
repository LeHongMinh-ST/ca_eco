import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import { CartId } from "../value-objects/cart-id.vo";
import { CartItem } from "../entities/cart-item.entity";

/**
 * CartItemAdded domain event is raised when an item is added to cart
 */
export class CartItemAdded implements DomainEvent {
  readonly name = "CartItemAdded";
  readonly occurredAt: Date;
  readonly cartId: CartId;
  readonly cartItem: CartItem;

  constructor(cartId: CartId, cartItem: CartItem) {
    this.cartId = cartId;
    this.cartItem = cartItem;
    this.occurredAt = new Date();
  }
}
