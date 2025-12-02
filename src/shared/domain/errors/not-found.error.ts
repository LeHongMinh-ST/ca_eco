import { DomainError } from "./domain.error";

/**
 * NotFoundError represents when a requested resource is not found
 * Should be mapped to HTTP 404 Not Found
 */
export class NotFoundError extends DomainError {
  constructor(
    message: string,
    field?: string,
    value?: unknown,
    metadata?: Record<string, unknown>,
  ) {
    super(message, "NOT_FOUND", {
      field,
      value,
      ...metadata,
    });
  }
}
