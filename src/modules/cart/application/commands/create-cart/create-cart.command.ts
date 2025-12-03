/**
 * CreateCartCommand represents the command to create a new cart
 */
export class CreateCartCommand {
  readonly userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }
}
