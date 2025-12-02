/**
 * ProductSnapshot represents a snapshot of product information
 * at the time it was added to cart. This ensures price and product details
 * remain consistent even if product information changes later.
 * Contains only data, no business logic or validation.
 */
export class ProductSnapshot {
  readonly productId: string;
  readonly name: string;
  readonly price: number;
  readonly image: string;

  constructor(
    productId: string,
    name: string,
    price: number,
    image: string,
  ) {
    this.productId = productId;
    this.name = name;
    this.price = price;
    this.image = image;
  }
}
