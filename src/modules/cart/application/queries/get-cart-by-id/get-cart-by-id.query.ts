/**
 * GetCartByIdQuery represents the query to get a cart by ID
 */
export class GetCartByIdQuery {
  readonly cartId: string;

  constructor(cartId: string) {
    this.cartId = cartId;
  }
}
