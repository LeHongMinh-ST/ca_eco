import { CartItemId } from "../value-objects/cart-item-id.vo";
import { CartQuantity } from "../value-objects/cart-quantity.vo";
import { ProductSnapshot } from "../value-objects/product-snapshot.vo";

/**
 * CartItem entity represents a single item in the shopping cart
 * Immutable value object that stores product information at time of addition
 */
export class CartItem {
  private readonly id: CartItemId;
  private readonly productSnapshot: ProductSnapshot;
  private readonly quantity: CartQuantity;

  private constructor(
    id: CartItemId,
    productSnapshot: ProductSnapshot,
    quantity: CartQuantity,
  ) {
    this.id = id;
    this.productSnapshot = productSnapshot;
    this.quantity = quantity;
  }

  /**
   * Factory method to create CartItem instance
   */
  static create(
    id: CartItemId,
    productSnapshot: ProductSnapshot,
    quantity: CartQuantity,
  ): CartItem {
    return new CartItem(id, productSnapshot, quantity);
  }

  /**
   * Creates a new CartItem with updated quantity
   * Returns new instance to maintain immutability
   */
  updateQuantity(newQuantity: CartQuantity): CartItem {
    return new CartItem(this.id, this.productSnapshot, newQuantity);
  }

  /**
   * Calculates total price for this cart item (quantity * price)
   */
  getTotalPrice(): number {
    return this.quantity.getValue() * this.productSnapshot.price;
  }

  /**
   * Gets cart item ID
   */
  getId(): CartItemId {
    return this.id;
  }

  /**
   * Gets product snapshot
   */
  getProductSnapshot(): ProductSnapshot {
    return this.productSnapshot;
  }

  /**
   * Gets product ID from snapshot
   */
  getProductId(): string {
    return this.productSnapshot.productId;
  }

  /**
   * Gets quantity
   */
  getQuantity(): CartQuantity {
    return this.quantity;
  }

  /**
   * Gets price from product snapshot
   */
  getPrice(): number {
    return this.productSnapshot.price;
  }

  /**
   * Compares two CartItems for equality based on ID
   */
  equals(other: CartItem): boolean {
    if (!other) {
      return false;
    }
    return this.id.equals(other.id);
  }

  /**
   * Checks if cart item is for the same product
   */
  isSameProduct(other: CartItem): boolean {
    if (!other) {
      return false;
    }
    return (
      this.productSnapshot.productId === other.productSnapshot.productId
    );
  }
}
