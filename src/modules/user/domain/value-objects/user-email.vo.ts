import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";
import { BaseVo } from "src/shared/domain/value-objects/base-vo.vo";

/**
 * UserEmail value object encapsulates email validation
 * Ensures email format is valid according to RFC 5322
 */
export class UserEmail extends BaseVo<string> {
  private static readonly MAX_LENGTH = 255;
  private static readonly EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  private constructor(value: string) {
    UserEmail.ensureValidEmail(value);
    super(value.toLowerCase().trim());
  }

  /**
   * Factory method to create UserEmail instance
   * @param value - Email string
   * @returns UserEmail instance
   * @throws InvalidInputError if validation fails
   */
  static create(value: string): UserEmail {
    return new UserEmail(value);
  }

  /**
   * Validates email meets domain requirements
   * - Must not be empty
   * - Must match valid email format
   * - Must be within length constraints
   */
  private static ensureValidEmail(value: string): void {
    if (!value || typeof value !== "string") {
      throw new InvalidInputError(
        "Email is required and must be a string",
        "email",
        value,
      );
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new InvalidInputError("Email cannot be empty", "email", value);
    }

    if (trimmedValue.length > UserEmail.MAX_LENGTH) {
      throw new InvalidInputError(
        `Email must not exceed ${UserEmail.MAX_LENGTH} characters`,
        "email",
        value,
      );
    }

    if (!UserEmail.EMAIL_REGEX.test(trimmedValue)) {
      throw new InvalidInputError(
        "Email format is invalid",
        "email",
        value,
      );
    }
  }
}

