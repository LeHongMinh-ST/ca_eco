/**
 * CreateProductResult represents the result of creating a product
 */
export class CreateProductResult {
  readonly productId: string;

  constructor(productId: string) {
    this.productId = productId;
  }
}
