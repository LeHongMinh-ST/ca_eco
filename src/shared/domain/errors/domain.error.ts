/**
 * Base DomainError class for all domain errors
 * Domain errors represent business rule violations and should be thrown from domain layer
 * They are framework-agnostic and can be mapped to HTTP exceptions in presentation layer
 */
export abstract class DomainError extends Error {
  /**
   * Error code for programmatic error handling
   * Should be unique per error type
   */
  public readonly code: string;

  /**
   * Additional context/metadata about the error
   */
  public readonly metadata?: Record<string, unknown>;

  /**
   * Timestamp when the error occurred
   */
  public readonly occurredAt: Date;

  constructor(
    message: string,
    code?: string,

    metadata?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code || this.constructor.name;
    this.metadata = metadata;
    this.occurredAt = new Date();

    // Maintains proper stack trace for where our error was thrown (only available on V8)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Returns a JSON representation of the error
   * Useful for logging and serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      metadata: this.metadata,
      occurredAt: this.occurredAt.toISOString(),
      stack: this.stack,
    };
  }
}
