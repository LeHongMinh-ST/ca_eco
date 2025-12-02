import { BaseId } from "src/shared/domain/value-objects/base-id.vo";

/**
 * ProductId value object encapsulates product identifier validation
 * Extends BaseId to ensure UUID format compliance
 */
export class ProductId extends BaseId {
  private constructor(value: string) {
    super(value);
  }

  /**
   * Factory method to create ProductId instance
   * @param value - Product UUID string
   * @returns ProductId instance
   * @throws InvalidInputError if UUID format is invalid
   */
  static create(value: string): ProductId {
    return new ProductId(value);
  }
}
