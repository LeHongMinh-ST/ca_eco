import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";
import { BaseVo } from "src/shared/domain/value-objects/base-vo.vo";

/**
 * CartItemPrice value object encapsulates cart item price validation
 * Stores the price at the time item was added to cart
 */
export class CartItemPrice extends BaseVo<number> {
  private static readonly MIN_PRICE = 0;
  private static readonly MAX_DECIMAL_PLACES = 2;

  private constructor(value: number) {
    CartItemPrice.ensureValidPrice(value);
    super(value);
  }

  /**
   * Factory method to create CartItemPrice instance
   * @param value - Cart item price number
   * @returns CartItemPrice instance
   * @throws InvalidInputError if validation fails
   */
  static create(value: number): CartItemPrice {
    return new CartItemPrice(value);
  }

  /**
   * Validates cart item price meets domain requirements
   * - Must be a valid number
   * - Must be greater than or equal to zero
   * - Must have at most 2 decimal places
   */
  private static ensureValidPrice(value: number): void {
    if (typeof value !== "number" || isNaN(value)) {
      throw new InvalidInputError(
        "Cart item price must be a valid number",
        "price",
        value,
      );
    }

    if (value < CartItemPrice.MIN_PRICE) {
      throw new InvalidInputError(
        `Cart item price must be at least ${CartItemPrice.MIN_PRICE}`,
        "price",
        value,
      );
    }

    if (!Number.isFinite(value)) {
      throw new InvalidInputError(
        "Cart item price must be a finite number",
        "price",
        value,
      );
    }

    // Check decimal places
    const decimalPlaces = CartItemPrice.getDecimalPlaces(value);
    if (decimalPlaces > CartItemPrice.MAX_DECIMAL_PLACES) {
      throw new InvalidInputError(
        `Cart item price must have at most ${CartItemPrice.MAX_DECIMAL_PLACES} decimal places`,
        "price",
        value,
      );
    }
  }

  /**
   * Calculates the number of decimal places in a number
   */
  private static getDecimalPlaces(value: number): number {
    if (Math.floor(value) === value) return 0;
    const str = value.toString();
    if (str.indexOf(".") !== -1 && str.indexOf("e-") === -1) {
      return str.split(".")[1].length;
    } else if (str.indexOf("e-") !== -1) {
      const parts = str.split("e-");
      return parseInt(parts[1], 10) + (parts[0].split(".")[1] || "").length;
    }
    return 0;
  }
}
