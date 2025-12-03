/**
 * CancelOrderCommand represents the command to cancel an order
 */
export class CancelOrderCommand {
  readonly orderId: string;

  constructor(orderId: string) {
    this.orderId = orderId;
  }
}

