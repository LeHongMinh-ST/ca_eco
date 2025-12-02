import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";
import { BaseVo } from "src/shared/domain/value-objects/base-vo.vo";

/**
 * ProductPrice value object encapsulates product price validation
 * Ensures price is a positive number with proper precision
 */
export class ProductPrice extends BaseVo<number> {
  private static readonly MIN_PRICE = 0;
  private static readonly MAX_DECIMAL_PLACES = 2;

  private constructor(value: number) {
    ProductPrice.ensureValidPrice(value);
    super(value);
  }

  /**
   * Factory method to create ProductPrice instance
   * @param value - Product price number
   * @returns ProductPrice instance
   * @throws InvalidInputError if validation fails
   */
  static create(value: number): ProductPrice {
    return new ProductPrice(value);
  }

  /**
   * Validates product price meets domain requirements
   * - Must be a valid number
   * - Must be greater than zero
   * - Must have at most 2 decimal places
   */
  private static ensureValidPrice(value: number): void {
    if (typeof value !== "number" || isNaN(value)) {
      throw new InvalidInputError(
        "Product price must be a valid number",
        "price",
        value,
      );
    }

    if (value <= ProductPrice.MIN_PRICE) {
      throw new InvalidInputError(
        `Product price must be greater than ${ProductPrice.MIN_PRICE}`,
        "price",
        value,
      );
    }

    if (!Number.isFinite(value)) {
      throw new InvalidInputError(
        "Product price must be a finite number",
        "price",
        value,
      );
    }

    // Check decimal places
    const decimalPlaces = ProductPrice.getDecimalPlaces(value);
    if (decimalPlaces > ProductPrice.MAX_DECIMAL_PLACES) {
      throw new InvalidInputError(
        `Product price must have at most ${ProductPrice.MAX_DECIMAL_PLACES} decimal places`,
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
