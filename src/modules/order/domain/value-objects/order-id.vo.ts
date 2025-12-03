import { BaseId } from "src/shared/domain/value-objects/base-id.vo";

/**
 * OrderId value object encapsulates order identifier validation
 * Extends BaseId to ensure UUID format compliance
 */
export class OrderId extends BaseId {
  private constructor(value: string) {
    super(value);
  }

  /**
   * Factory method to create OrderId instance
   * @param value - Order UUID string
   * @returns OrderId instance
   */
  static create(value: string): OrderId {
    return new OrderId(value);
  }
}

