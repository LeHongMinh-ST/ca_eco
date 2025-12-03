/**
 * GetUserByIdQuery represents the query to get a user by ID
 */
export class GetUserByIdQuery {
  readonly userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }
}

