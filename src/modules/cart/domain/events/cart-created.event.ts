import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import { CartId } from "../value-objects/cart-id.vo";
import { UserId } from "src/modules/user/domain/value-objects/user-id.vo";

/**
 * CartCreated domain event is raised when a new cart is created
 */
export class CartCreated implements DomainEvent {
  readonly name = "CartCreated";
  readonly occurredAt: Date;
  readonly cartId: CartId;
  readonly userId: UserId;

  constructor(cartId: CartId, userId: UserId) {
    this.cartId = cartId;
    this.userId = userId;
    this.occurredAt = new Date();
  }
}
