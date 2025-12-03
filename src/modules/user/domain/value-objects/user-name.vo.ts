import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";
import { BaseVo } from "src/shared/domain/value-objects/base-vo.vo";

/**
 * UserName value object encapsulates user name validation
 * Ensures name is not empty and within acceptable length limits
 */
export class UserName extends BaseVo<string> {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 255;

  private constructor(value: string) {
    UserName.ensureValidName(value);
    super(value.trim());
  }

  /**
   * Factory method to create UserName instance
   * @param value - User name string
   * @returns UserName instance
   * @throws InvalidInputError if validation fails
   */
  static create(value: string): UserName {
    return new UserName(value);
  }

  /**
   * Validates user name meets domain requirements
   * - Must not be empty or whitespace only
   * - Must be within length constraints
   */
  private static ensureValidName(value: string): void {
    if (!value || typeof value !== "string") {
      throw new InvalidInputError(
        "User name is required and must be a string",
        "name",
        value,
      );
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length < UserName.MIN_LENGTH) {
      throw new InvalidInputError(
        `User name must be at least ${UserName.MIN_LENGTH} character(s)`,
        "name",
        value,
      );
    }

    if (trimmedValue.length > UserName.MAX_LENGTH) {
      throw new InvalidInputError(
        `User name must not exceed ${UserName.MAX_LENGTH} characters`,
        "name",
        value,
      );
    }
  }
}

