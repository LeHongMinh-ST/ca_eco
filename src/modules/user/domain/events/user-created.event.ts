import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import { UserId } from "../value-objects/user-id.vo";

/**
 * UserCreated domain event
 * Raised when a new user is created
 */
export class UserCreated implements DomainEvent {
  readonly name = "UserCreated";
  readonly occurredAt: Date;
  readonly userId: UserId;

  constructor(userId: UserId) {
    this.userId = userId;
    this.occurredAt = new Date();
  }
}

