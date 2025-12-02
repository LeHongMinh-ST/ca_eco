/**
 * UpdateProductCommand represents the command to update an existing product
 */
export class UpdateProductCommand {
  readonly productId: string;
  readonly name?: string;
  readonly price?: number;
  readonly image?: string;

  constructor(
    productId: string,
    name?: string,
    price?: number,
    image?: string,
  ) {
    this.productId = productId;
    this.name = name;
    this.price = price;
    this.image = image;
  }
}
