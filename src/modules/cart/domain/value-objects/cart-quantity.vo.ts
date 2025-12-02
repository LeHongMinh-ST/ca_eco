import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";
import { BaseVo } from "src/shared/domain/value-objects/base-vo.vo";

/**
 * CartQuantity value object encapsulates cart item quantity validation
 * Ensures quantity is a positive integer
 */
export class CartQuantity extends BaseVo<number> {
  private static readonly MIN_QTY = 1;

  private constructor(value: number) {
    CartQuantity.ensureValidQuantity(value);
    super(value);
  }

  /**
   * Factory method to create CartQuantity instance
   * @param value - Cart item quantity number
   * @returns CartQuantity instance
   * @throws InvalidInputError if validation fails
   */
  static create(value: number): CartQuantity {
    return new CartQuantity(value);
  }

  /**
   * Validates cart quantity meets domain requirements
   * - Must be a valid number
   * - Must be a positive integer (at least 1)
   * - Must be finite
   */
  private static ensureValidQuantity(value: number): void {
    if (typeof value !== "number" || isNaN(value)) {
      throw new InvalidInputError(
        "Cart quantity must be a valid number",
        "quantity",
        value,
      );
    }

    if (!Number.isFinite(value)) {
      throw new InvalidInputError(
        "Cart quantity must be a finite number",
        "quantity",
        value,
      );
    }

    if (!Number.isInteger(value)) {
      throw new InvalidInputError(
        "Cart quantity must be an integer",
        "quantity",
        value,
      );
    }

    if (value < CartQuantity.MIN_QTY) {
      throw new InvalidInputError(
        `Cart quantity must be at least ${CartQuantity.MIN_QTY}`,
        "quantity",
        value,
      );
    }
  }
}
