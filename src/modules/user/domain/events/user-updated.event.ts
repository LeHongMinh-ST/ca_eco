import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import { UserId } from "../value-objects/user-id.vo";

/**
 * UserUpdated domain event
 * Raised when user information is updated
 */
export class UserUpdated implements DomainEvent {
  readonly name = "UserUpdated";
  readonly occurredAt: Date;
  readonly userId: UserId;

  constructor(userId: UserId) {
    this.userId = userId;
    this.occurredAt = new Date();
  }
}

