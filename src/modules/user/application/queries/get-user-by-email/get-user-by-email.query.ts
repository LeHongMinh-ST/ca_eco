/**
 * GetUserByEmailQuery represents the query to get a user by email
 */
export class GetUserByEmailQuery {
  readonly email: string;

  constructor(email: string) {
    this.email = email;
  }
}

