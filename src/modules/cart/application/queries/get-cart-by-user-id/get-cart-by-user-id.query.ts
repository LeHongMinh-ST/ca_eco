/**
 * GetCartByUserIdQuery represents the query to get a cart by user ID
 */
export class GetCartByUserIdQuery {
  readonly userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }
}
