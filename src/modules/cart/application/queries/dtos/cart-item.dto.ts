import { ApiProperty } from "@nestjs/swagger";
import { CartItem } from "src/modules/cart/domain/entities/cart-item.entity";

/**
 * CartItemDto represents the cart item data transfer object
 * Used for returning cart item data from queries
 */
export class CartItemDto {
  @ApiProperty({
    description: "Cart item ID (UUID)",
    example: "333e4567-e89b-12d3-a456-426614174002",
  })
  readonly id: string;

  @ApiProperty({
    description: "Product ID (UUID)",
    example: "223e4567-e89b-12d3-a456-426614174001",
  })
  readonly productId: string;

  @ApiProperty({
    description: "Product name",
    example: "iPhone 15 Pro Max",
  })
  readonly productName: string;

  @ApiProperty({
    description: "Product price in VND",
    example: 29990000,
  })
  readonly productPrice: number;

  @ApiProperty({
    description: "Product image URL",
    example: "https://example.com/images/iphone-15-pro-max.jpg",
  })
  readonly productImage: string;

  @ApiProperty({
    description: "Quantity of this product in cart",
    example: 2,
  })
  readonly quantity: number;

  @ApiProperty({
    description: "Total price for this item (productPrice * quantity)",
    example: 59980000,
  })
  readonly totalPrice: number;

  constructor(
    id: string,
    productId: string,
    productName: string,
    productPrice: number,
    productImage: string,
    quantity: number,
    totalPrice: number,
  ) {
    this.id = id;
    this.productId = productId;
    this.productName = productName;
    this.productPrice = productPrice;
    this.productImage = productImage;
    this.quantity = quantity;
    this.totalPrice = totalPrice;
  }

  /**
   * Creates CartItemDto from CartItem entity
   * @param item - CartItem entity
   * @returns CartItemDto instance
   */
  static fromEntity(item: CartItem): CartItemDto {
    const snapshot = item.getProductSnapshot();
    return new CartItemDto(
      item.getId().getValue(),
      snapshot.productId,
      snapshot.name,
      snapshot.price,
      snapshot.image,
      item.getQuantity().getValue(),
      item.getTotalPrice(),
    );
  }
}
