/**
 * CreateOrderCommand represents the command to create a new order from cart
 */
export class CreateOrderCommand {
  readonly cartId: string;

  constructor(cartId: string) {
    this.cartId = cartId;
  }
}

