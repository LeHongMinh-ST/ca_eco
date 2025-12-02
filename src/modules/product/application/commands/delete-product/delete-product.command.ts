/**
 * DeleteProductCommand represents the command to delete a product
 */
export class DeleteProductCommand {
  readonly productId: string;

  constructor(productId: string) {
    this.productId = productId;
  }
}
