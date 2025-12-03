/**
 * DeleteUserCommand represents the command to delete a user
 */
export class DeleteUserCommand {
  readonly userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }
}

