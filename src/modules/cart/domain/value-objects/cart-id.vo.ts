import { BaseId } from "src/shared/domain/value-objects/base-id.vo";

/**
 * CartId value object encapsulates cart identifier validation
 * Extends BaseId to ensure UUID format compliance
 */
export class CartId extends BaseId {
  private constructor(value: string) {
    super(value);
  }

  /**
   * Factory method to create CartId instance
   * @param value - Cart UUID string
   * @returns CartId instance
   * @throws InvalidInputError if UUID format is invalid
   */
  static create(value: string): CartId {
    return new CartId(value);
  }
}
