/**
 * RemoveItemFromCartCommand represents the command to remove an item from cart
 */
export class RemoveItemFromCartCommand {
  readonly cartId: string;
  readonly itemId: string;

  constructor(cartId: string, itemId: string) {
    this.cartId = cartId;
    this.itemId = itemId;
  }
}
