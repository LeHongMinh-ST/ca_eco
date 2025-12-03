import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";

/**
 * OrderItem value object represents a single item in an order
 * Immutable value object that stores product information at time of order creation
 */
export class OrderItem {
  private readonly productId: ProductId;
  private readonly productName: string;
  private readonly productPrice: number;
  private readonly quantity: number;
  private readonly totalPrice: number;

  private constructor(
    productId: ProductId,
    productName: string,
    productPrice: number,
    quantity: number,
  ) {
    OrderItem.ensureValidOrderItem(productName, productPrice, quantity);

    this.productId = productId;
    this.productName = productName;
    this.productPrice = productPrice;
    this.quantity = quantity;
    this.totalPrice = productPrice * quantity;
  }

  /**
   * Factory method to create OrderItem instance
   * @param productId - Product identifier
   * @param productName - Product name
   * @param productPrice - Product price per unit
   * @param quantity - Quantity ordered
   * @returns OrderItem instance
   */
  static create(
    productId: ProductId,
    productName: string,
    productPrice: number,
    quantity: number,
  ): OrderItem {
    return new OrderItem(productId, productName, productPrice, quantity);
  }

  /**
   * Validates order item data
   */
  private static ensureValidOrderItem(
    productName: string,
    productPrice: number,
    quantity: number,
  ): void {
    if (!productName || typeof productName !== "string" || productName.trim().length === 0) {
      throw new InvalidInputError(
        "Product name is required and must be a non-empty string",
        "productName",
        productName,
      );
    }

    if (productName.length > 255) {
      throw new InvalidInputError(
        "Product name must not exceed 255 characters",
        "productName",
        productName,
      );
    }

    if (typeof productPrice !== "number" || productPrice < 0) {
      throw new InvalidInputError(
        "Product price must be a non-negative number",
        "productPrice",
        productPrice,
      );
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new InvalidInputError(
        "Quantity must be a positive integer",
        "quantity",
        quantity,
      );
    }
  }

  /**
   * Gets product ID
   */
  getProductId(): ProductId {
    return this.productId;
  }

  /**
   * Gets product name
   */
  getProductName(): string {
    return this.productName;
  }

  /**
   * Gets product price per unit
   */
  getProductPrice(): number {
    return this.productPrice;
  }

  /**
   * Gets quantity ordered
   */
  getQuantity(): number {
    return this.quantity;
  }

  /**
   * Gets total price for this item (price * quantity)
   */
  getTotalPrice(): number {
    return this.totalPrice;
  }

  /**
   * Compares two OrderItem instances for equality based on productId
   */
  equals(other: OrderItem): boolean {
    if (!other) {
      return false;
    }
    return this.productId.equals(other.productId);
  }
}

