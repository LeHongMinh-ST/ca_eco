import { CartItem } from "src/modules/cart/domain/entities/cart-item.entity";

/**
 * CartItemDto represents the cart item data transfer object
 * Used for returning cart item data from queries
 */
export class CartItemDto {
  readonly id: string;
  readonly productId: string;
  readonly productName: string;
  readonly productPrice: number;
  readonly productImage: string;
  readonly quantity: number;
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
