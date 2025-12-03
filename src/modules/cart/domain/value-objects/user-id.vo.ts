import { BaseId } from "src/shared/domain/value-objects/base-id.vo";

/**
 * UserId value object for Cart domain
 * Represents user identifier as a string value object
 * Does not depend on User domain - follows Dependency Inversion Principle
 */
export class UserId extends BaseId {
  private constructor(value: string) {
    super(value);
  }

  /**
   * Factory method to create UserId instance
   * @param value - User UUID string
   * @returns UserId instance
   * @throws InvalidInputError if UUID format is invalid
   */
  static create(value: string): UserId {
    return new UserId(value);
  }
}
