import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import { CartId } from "../value-objects/cart-id.vo";

/**
 * CartCleared domain event is raised when all items are removed from cart
 */
export class CartCleared implements DomainEvent {
  readonly name = "CartCleared";
  readonly occurredAt: Date;
  readonly cartId: CartId;

  constructor(cartId: CartId) {
    this.cartId = cartId;
    this.occurredAt = new Date();
  }
}
