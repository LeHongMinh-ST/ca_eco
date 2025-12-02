/**
 * InvalidInputError represents when input validation fails
 * Should be mapped to HTTP 400 Bad Request
 */

import { DomainError } from "./domain.error";


export class InvalidInputError extends DomainError {
  constructor(

    message: string,

    field?: string,

    value?: unknown,
    metadata?: Record<string, unknown>,

  ) {
    super(message, "INVALID_INPUT", {
      field,
      value,
      ...metadata,
    });
  }
}

