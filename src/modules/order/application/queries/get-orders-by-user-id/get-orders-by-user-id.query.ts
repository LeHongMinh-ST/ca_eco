/**
 * GetOrdersByUserIdQuery represents the query to get orders by user ID
 */
export class GetOrdersByUserIdQuery {
  readonly userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }
}

