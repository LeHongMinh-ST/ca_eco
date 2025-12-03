import { BaseEntity } from "src/shared/domain/entities/base.entity";
import { UserCreated } from "../events/user-created.event";
import { UserUpdated } from "../events/user-updated.event";
import { UserEmailChanged } from "../events/user-email-changed.event";
import { UserId } from "../value-objects/user-id.vo";
import { UserEmail } from "../value-objects/user-email.vo";
import { UserName } from "../value-objects/user-name.vo";
import { UserPassword } from "../value-objects/user-password.vo";

/**
 * User aggregate root entity
 * Encapsulates user business logic and invariants
 */
export class User extends BaseEntity<UserId> {
  private email: UserEmail;
  private name: UserName;
  private password: UserPassword;

  private constructor(
    id: UserId,
    email: UserEmail,
    name: UserName,
    password: UserPassword,
  ) {
    super(id);
    this.email = email;
    this.name = name;
    this.password = password;
  }

  /**
   * Factory method to create a new User instance
   * Raises UserCreated domain event
   */
  static create(
    id: UserId,
    email: UserEmail,
    name: UserName,
    password: UserPassword,
  ): User {
    const user = new User(id, email, name, password);
    user.recordEvent(new UserCreated(id));
    return user;
  }

  /**
   * Reconstitutes User from persistence layer
   * Does not raise domain events (used when loading from database)
   */
  static reconstitute(
    id: UserId,
    email: UserEmail,
    name: UserName,
    password: UserPassword,
  ): User {
    return new User(id, email, name, password);
  }

  /**
   * Updates user email and raises domain event if email changed
   */
  updateEmail(newEmail: UserEmail): void {
    if (this.email.getValue() === newEmail.getValue()) {
      return; // No change, skip event
    }

    const oldEmail = this.email;
    this.email = newEmail;
    this.recordEvent(new UserEmailChanged(this.getId(), oldEmail, newEmail));
    this.recordEvent(new UserUpdated(this.getId()));
  }

  /**
   * Updates user name
   */
  updateName(newName: UserName): void {
    if (this.name.getValue() === newName.getValue()) {
      return; // No change, skip event
    }

    this.name = newName;
    this.recordEvent(new UserUpdated(this.getId()));
  }

  /**
   * Updates user password
   * Note: Password should be hashed before calling this method
   */
  updatePassword(newPassword: UserPassword): void {
    this.password = newPassword;
    this.recordEvent(new UserUpdated(this.getId()));
  }

  /**
   * Gets user email value object
   */
  getEmail(): UserEmail {
    return this.email;
  }

  /**
   * Gets user name value object
   */
  getName(): UserName {
    return this.name;
  }

  /**
   * Gets user password value object
   * Note: Returns hashed password, not plain text
   */
  getPassword(): UserPassword {
    return this.password;
  }

  /**
   * Compares two User entities for equality based on ID
   */
  equals(other: User): boolean {
    if (!other) {
      return false;
    }
    return this.getId().equals(other.getId());
  }
}
