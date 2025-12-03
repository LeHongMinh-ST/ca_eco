/**
 * CreateUserCommand represents the command to create a new user
 */
export class CreateUserCommand {
  readonly email: string;
  readonly name: string;
  readonly password: string;

  constructor(email: string, name: string, password: string) {
    this.email = email;
    this.name = name;
    this.password = password;
  }
}

