/**
 * UpdateItemQuantityCommand represents the command to update cart item quantity
 */
export class UpdateItemQuantityCommand {
  readonly cartId: string;
  readonly itemId: string;
  readonly quantity: number;

  constructor(cartId: string, itemId: string, quantity: number) {
    this.cartId = cartId;
    this.itemId = itemId;
    this.quantity = quantity;
  }
}
