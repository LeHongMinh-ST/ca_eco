import { BaseId } from "src/shared/domain/value-objects/base-id.vo";

/**
 * InventoryId value object encapsulates inventory identifier validation
 * Extends BaseId to ensure UUID format compliance
 */
export class InventoryId extends BaseId {
  private constructor(value: string) {
    super(value);
  }

  /**
   * Factory method to create InventoryId instance
   * @param value - Inventory UUID string
   * @returns InventoryId instance
   * @throws InvalidInputError if UUID format is invalid
   */
  static create(value: string): InventoryId {
    return new InventoryId(value);
  }
}
