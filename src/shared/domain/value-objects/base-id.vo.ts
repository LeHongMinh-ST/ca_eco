import { InvalidInputError } from "../errors/invalid-input.error";
import { BaseVo } from "./base-vo.vo";

/**
 * BaseId value object encapsulates UUID validation for aggregate identifiers
 * Domain specific IDs should extend this class for consistent behaviour
 */
export abstract class BaseId extends BaseVo<string> {

  protected constructor(value: string) {
    BaseId.ensureValidUuid(value);
    super(value);
  }


  /**
   * Checks equality between two identifiers
   */
  equals(other: BaseId): boolean {
    return this.getValue() === other.getValue();
  }

  /**
   * Validates UUID format (RFC 4122 compliant)
   */
  private static ensureValidUuid(value: string): void {
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(value)) {
      throw new InvalidInputError("Identifier must be a valid UUID", "id");
    }
  }
}

