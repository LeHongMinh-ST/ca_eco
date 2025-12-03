/**
 * CreateCartResult represents the result of creating a cart
 */
export class CreateCartResult {
  readonly cartId: string;

  constructor(cartId: string) {
    this.cartId = cartId;
  }
}
