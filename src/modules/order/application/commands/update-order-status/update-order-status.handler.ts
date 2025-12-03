import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { NotFoundError } from "src/shared/domain/errors/not-found.error";
import type { IOrderRepository } from "src/modules/order/domain/repositories/order.repository.interface";
import { OrderRepositoryToken } from "src/modules/order/domain/repositories/order.repository.interface";
import { OrderId } from "src/modules/order/domain/value-objects/order-id.vo";
import { OrderStatus } from "src/modules/order/domain/value-objects/order-status.vo";
import { UpdateOrderStatusCommand } from "./update-order-status.command";

/**
 * UpdateOrderStatusHandler handles updating order status
 */
@CommandHandler(UpdateOrderStatusCommand)
export class UpdateOrderStatusHandler
  implements ICommandHandler<UpdateOrderStatusCommand, void>
{
  constructor(
    @Inject(OrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
  ) {}

  /**
   * Executes the update order status command
   * @param command - UpdateOrderStatusCommand containing order ID and new status
   * @returns Promise that resolves when update is complete
   * @throws NotFoundError if order does not exist
   */
  async execute(command: UpdateOrderStatusCommand): Promise<void> {
    const orderId = OrderId.create(command.orderId);

    // Find existing order
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError(
        "Order not found",
        "orderId",
        orderId.getValue(),
      );
    }

    // Update status
    const newStatus = OrderStatus.create(command.status);
    order.updateStatus(newStatus);

    // Save order
    await this.orderRepository.save(order);
  }
}

