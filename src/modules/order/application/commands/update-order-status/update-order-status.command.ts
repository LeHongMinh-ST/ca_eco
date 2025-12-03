import { OrderStatusEnum } from "src/modules/order/domain/value-objects/order-status.vo";

/**
 * UpdateOrderStatusCommand represents the command to update order status
 */
export class UpdateOrderStatusCommand {
  readonly orderId: string;
  readonly status: OrderStatusEnum;

  constructor(orderId: string, status: OrderStatusEnum) {
    this.orderId = orderId;
    this.status = status;
  }
}

