import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";
import { BaseVo } from "src/shared/domain/value-objects/base-vo.vo";

/**
 * UserPassword value object encapsulates password validation
 * Note: In production, passwords should be hashed before storing
 * This value object stores the hashed password, not the plain text
 */
export class UserPassword extends BaseVo<string> {
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 255;

  private constructor(value: string) {
    UserPassword.ensureValidPassword(value);
    super(value);
  }

  /**
   * Factory method to create UserPassword instance
   * @param value - Password string (should be hashed)
   * @returns UserPassword instance
   * @throws InvalidInputError if validation fails
   */
  static create(value: string): UserPassword {
    return new UserPassword(value);
  }

  /**
   * Validates password meets domain requirements
   * - Must not be empty
   * - Must be within length constraints
   * Note: This validates the hashed password format, not plain text
   */
  private static ensureValidPassword(value: string): void {
    if (!value || typeof value !== "string") {
      throw new InvalidInputError(
        "Password is required and must be a string",
        "password",
      );
    }

    if (value.length < UserPassword.MIN_LENGTH) {
      throw new InvalidInputError(
        `Password must be at least ${UserPassword.MIN_LENGTH} character(s)`,
        "password",
      );
    }

    if (value.length > UserPassword.MAX_LENGTH) {
      throw new InvalidInputError(
        `Password must not exceed ${UserPassword.MAX_LENGTH} characters`,
        "password",
      );
    }
  }
}

