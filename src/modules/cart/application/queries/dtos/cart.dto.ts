import { Cart } from "src/modules/cart/domain/entities/cart.entity";
import { CartItemDto } from "./cart-item.dto";

/**
 * CartDto represents the cart data transfer object
 * Used for returning cart data from queries
 */
export class CartDto {
  readonly id: string;
  readonly userId: string;
  readonly items: CartItemDto[];
  readonly totalItemsCount: number;
  readonly uniqueItemsCount: number;
  readonly totalPrice: number;
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
