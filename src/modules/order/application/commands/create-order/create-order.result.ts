/**
 * CreateOrderResult represents the result of creating an order
 */
export class CreateOrderResult {
  readonly orderId: string;

  constructor(orderId: string) {
    this.orderId = orderId;
  }
}

