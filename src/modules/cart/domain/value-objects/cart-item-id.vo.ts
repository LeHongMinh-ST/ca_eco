import { BaseId } from "src/shared/domain/value-objects/base-id.vo";

/**
 * CartItemId value object encapsulates cart item identifier validation
 * Extends BaseId to ensure UUID format compliance
 */
export class CartItemId extends BaseId {
  private constructor(value: string) {
    super(value);
  }

  /**
   * Factory method to create CartItemId instance
   * @param value - Cart item UUID string
   * @returns CartItemId instance
   * @throws InvalidInputError if UUID format is invalid
   */
  static create(value: string): CartItemId {
    return new CartItemId(value);
  }
}
