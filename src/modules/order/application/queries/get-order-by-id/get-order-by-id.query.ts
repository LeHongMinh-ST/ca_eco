/**
 * GetOrderByIdQuery represents the query to get an order by ID
 */
export class GetOrderByIdQuery {
  readonly orderId: string;

  constructor(orderId: string) {
    this.orderId = orderId;
  }
}

