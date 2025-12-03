/**
 * AddItemToCartCommand represents the command to add an item to cart
 */
export class AddItemToCartCommand {
  readonly cartId: string;
  readonly productId: string;
  readonly quantity: number;

  constructor(cartId: string, productId: string, quantity: number) {
    this.cartId = cartId;
    this.productId = productId;
    this.quantity = quantity;
  }
}
