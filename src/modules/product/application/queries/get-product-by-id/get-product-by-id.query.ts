/**
 * GetProductByIdQuery represents the query to get a product by ID
 */
export class GetProductByIdQuery {
  readonly productId: string;

  constructor(productId: string) {
    this.productId = productId;
  }
}
