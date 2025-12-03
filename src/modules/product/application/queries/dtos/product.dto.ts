import { ApiProperty } from "@nestjs/swagger";
import { Product } from "src/modules/product/domain/entities/product.entity";

/**
 * ProductDto represents the product data transfer object
 * Used for returning product data from queries
 */
export class ProductDto {
  @ApiProperty({
    description: "Product ID (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  readonly id: string;

  @ApiProperty({
    description: "Product name",
    example: "iPhone 15 Pro Max",
  })
  readonly name: string;

  @ApiProperty({
    description: "Product price in VND",
    example: 29990000,
  })
  readonly price: number;

  @ApiProperty({
    description: "Product image URL",
    example: "https://example.com/images/iphone-15-pro-max.jpg",
  })
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
