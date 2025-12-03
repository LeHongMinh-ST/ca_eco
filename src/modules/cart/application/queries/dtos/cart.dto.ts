import { ApiProperty } from "@nestjs/swagger";
import { Cart } from "src/modules/cart/domain/entities/cart.entity";
import { CartItemDto } from "./cart-item.dto";

/**
 * CartDto represents the cart data transfer object
 * Used for returning cart data from queries
 */
export class CartDto {
  @ApiProperty({
    description: "Cart ID (UUID)",
    example: "443e4567-e89b-12d3-a456-426614174003",
  })
  readonly id: string;

  @ApiProperty({
    description: "User ID (UUID) who owns the cart",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  readonly userId: string;

  @ApiProperty({
    description: "List of items in the cart",
    type: [CartItemDto],
  })
  readonly items: CartItemDto[];

  @ApiProperty({
    description: "Total number of items (sum of all quantities)",
    example: 5,
  })
  readonly totalItemsCount: number;

  @ApiProperty({
    description: "Number of unique products in cart",
    example: 3,
  })
  readonly uniqueItemsCount: number;

  @ApiProperty({
    description: "Total price of all items in cart (VND)",
    example: 89970000,
  })
  readonly totalPrice: number;

  @ApiProperty({
    description: "Whether the cart is empty",
    example: false,
  })
  readonly isEmpty: boolean;

  constructor(
    id: string,
    userId: string,
    items: CartItemDto[],
    totalItemsCount: number,
    uniqueItemsCount: number,
    totalPrice: number,
    isEmpty: boolean,
  ) {
    this.id = id;
    this.userId = userId;
    this.items = items;
    this.totalItemsCount = totalItemsCount;
    this.uniqueItemsCount = uniqueItemsCount;
    this.totalPrice = totalPrice;
    this.isEmpty = isEmpty;
  }

  /**
   * Creates CartDto from Cart entity
   * @param cart - Cart entity
   * @returns CartDto instance
   */
  static fromEntity(cart: Cart): CartDto {
    const items = cart.getItems().map((item) => CartItemDto.fromEntity(item));
    return new CartDto(
      cart.getId().getValue(),
      cart.getUserId().getValue(),
      items,
      cart.getTotalItemsCount(),
      cart.getUniqueItemsCount(),
      cart.getTotalPrice(),
      cart.isEmpty(),
    );
  }
}
