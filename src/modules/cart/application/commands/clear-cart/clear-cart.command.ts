/**
 * ClearCartCommand represents the command to clear all items from cart
 */
export class ClearCartCommand {
  readonly cartId: string;

  constructor(cartId: string) {
    this.cartId = cartId;
  }
}
