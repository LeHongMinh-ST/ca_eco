/**
 * UpdateUserNameCommand represents the command to update user name
 */
export class UpdateUserNameCommand {
  readonly userId: string;
  readonly name: string;

  constructor(userId: string, name: string) {
    this.userId = userId;
    this.name = name;
  }
}

