/**
 * UpdateUserPasswordCommand represents the command to update user password
 * Note: Password should be hashed before calling this command
 */
export class UpdateUserPasswordCommand {
  readonly userId: string;
  readonly password: string;

  constructor(userId: string, password: string) {
    this.userId = userId;
    this.password = password;
  }
}

