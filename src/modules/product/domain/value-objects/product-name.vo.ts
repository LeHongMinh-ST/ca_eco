import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";
import { BaseVo } from "src/shared/domain/value-objects/base-vo.vo";

/**
 * ProductName value object encapsulates product name validation
 * Ensures name is not empty and within acceptable length limits
 */
export class ProductName extends BaseVo<string> {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 255;

  private constructor(value: string) {
    ProductName.ensureValidName(value);
    super(value);
  }

  /**
   * Factory method to create ProductName instance
   * @param value - Product name string
   * @returns ProductName instance
   * @throws InvalidInputError if validation fails
   */
  static create(value: string): ProductName {
    return new ProductName(value);
  }

  /**
   * Validates product name meets domain requirements
   * - Must not be empty or whitespace only
   * - Must be within length constraints
   */
  private static ensureValidName(value: string): void {
    if (!value || typeof value !== "string") {
      throw new InvalidInputError(
        "Product name is required and must be a string",
        "name",
        value,
      );
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length < ProductName.MIN_LENGTH) {
      throw new InvalidInputError(
        `Product name must be at least ${ProductName.MIN_LENGTH} character(s)`,
        "name",
        value,
      );
    }

    if (trimmedValue.length > ProductName.MAX_LENGTH) {
      throw new InvalidInputError(
        `Product name must not exceed ${ProductName.MAX_LENGTH} characters`,
        "name",
        value,
      );
    }
  }
}
