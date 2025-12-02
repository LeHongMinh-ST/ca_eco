import { Product } from "src/modules/product/domain/entities/product.entity";

/**
 * ProductDto represents the product data transfer object
 * Used for returning product data from queries
 */
export class ProductDto {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly image: string;

  constructor(id: string, name: string, price: number, image: string) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.image = image;
  }

  /**
   * Creates ProductDto from Product entity
   * @param product - Product entity
   * @returns ProductDto instance
   */
  static fromEntity(product: Product): ProductDto {
    return new ProductDto(
      product.getId().getValue(),
      product.getName().getValue(),
      product.getPrice().getValue(),
      product.getImage().getValue(),
    );
  }
}
