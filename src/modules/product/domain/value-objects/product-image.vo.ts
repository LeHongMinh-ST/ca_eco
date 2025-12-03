import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";
import { BaseVo } from "src/shared/domain/value-objects/base-vo.vo";

/**
 * ProductImage value object encapsulates product image URL validation
 * Ensures image URL is valid or at least a non-empty string
 */
export class ProductImage extends BaseVo<string> {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 2048;

  private constructor(value: string) {
    ProductImage.ensureValidImage(value);
    super(value);
  }

  /**
   * Factory method to create ProductImage instance
   * @param value - Product image URL string
   * @returns ProductImage instance
   * @throws InvalidInputError if validation fails
   */
  static create(value: string): ProductImage {
    return new ProductImage(value);
  }

  /**
   * Validates product image URL meets domain requirements
   * - Must be a non-empty string
   * - Must be within length constraints
   * - Should be a valid URL format (optional but recommended)
   */
  private static ensureValidImage(value: string): void {
    if (!value || typeof value !== "string") {
      throw new InvalidInputError(
        "Product image URL is required and must be a string",
        "image",
        value,
      );
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length < ProductImage.MIN_LENGTH) {
      throw new InvalidInputError(
        `Product image URL must be at least ${ProductImage.MIN_LENGTH} character(s)`,
        "image",
        value,
      );
    }

    if (trimmedValue.length > ProductImage.MAX_LENGTH) {
      throw new InvalidInputError(
        `Product image URL must not exceed ${ProductImage.MAX_LENGTH} characters`,
        "image",
        value,
      );
    }

    // Optional: Validate URL format if it looks like a URL
    if (
      trimmedValue.startsWith("http://") ||
      trimmedValue.startsWith("https://")
    ) {
      try {
        new URL(trimmedValue);
      } catch {
        throw new InvalidInputError(
          "Product image URL must be a valid URL format",
          "image",
          value,
        );
      }
    }
  }
}
