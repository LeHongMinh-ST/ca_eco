import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";
import { BaseVo } from "src/shared/domain/value-objects/base-vo.vo";

/**
 * Quantity value object encapsulates inventory quantity validation
 * Ensures quantity is a non-negative integer
 */
export class Quantity extends BaseVo<number> {
  private static readonly MIN_QTY = 0;

  private constructor(value: number) {
    Quantity.ensureValidQuantity(value);
    super(value);
  }

  /**
   * Factory method to create Quantity instance
   * @param value - Quantity number
   * @returns Quantity instance
   * @throws InvalidInputError if validation fails
   */
  static create(value: number): Quantity {
    return new Quantity(value);
  }

  /**
   * Validates quantity meets domain requirements
   * - Must be a valid number
   * - Must be a non-negative integer
   * - Must be finite
   */
  private static ensureValidQuantity(value: number): void {
    if (typeof value !== "number" || isNaN(value)) {
      throw new InvalidInputError(
        "Quantity must be a valid number",
        "quantity",
        value,
      );
    }

    if (!Number.isFinite(value)) {
      throw new InvalidInputError(
        "Quantity must be a finite number",
        "quantity",
        value,
      );
    }

    if (!Number.isInteger(value)) {
      throw new InvalidInputError(
        "Quantity must be an integer",
        "quantity",
        value,
      );
    }

    if (value < Quantity.MIN_QTY) {
      throw new InvalidInputError(
        `Quantity must be at least ${Quantity.MIN_QTY}`,
        "quantity",
        value,
      );
    }
  }
}
