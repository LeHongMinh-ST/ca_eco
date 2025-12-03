import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import { UserId } from "../value-objects/user-id.vo";
import { UserEmail } from "../value-objects/user-email.vo";

/**
 * UserEmailChanged domain event
 * Raised when user email is changed
 */
export class UserEmailChanged implements DomainEvent {
  readonly name = "UserEmailChanged";
  readonly occurredAt: Date;
  readonly userId: UserId;
  readonly oldEmail: UserEmail;
  readonly newEmail: UserEmail;

  constructor(userId: UserId, oldEmail: UserEmail, newEmail: UserEmail) {
    this.userId = userId;
    this.oldEmail = oldEmail;
    this.newEmail = newEmail;
    this.occurredAt = new Date();
  }
}

