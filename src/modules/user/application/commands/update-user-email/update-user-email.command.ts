/**
 * UpdateUserEmailCommand represents the command to update user email
 */
export class UpdateUserEmailCommand {
  readonly userId: string;
  readonly email: string;

  constructor(userId: string, email: string) {
    this.userId = userId;
    this.email = email;
  }
}

