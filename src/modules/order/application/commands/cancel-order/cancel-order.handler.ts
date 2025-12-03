import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { NotFoundError } from "src/shared/domain/errors/not-found.error";
import type { IOrderRepository } from "src/modules/order/domain/repositories/order.repository.interface";
import { OrderRepositoryToken } from "src/modules/order/domain/repositories/order.repository.interface";
import type { IInventoryServicePort } from "src/modules/order/domain/services/inventory-service.port";
import { InventoryServicePortToken } from "src/modules/order/domain/services/inventory-service.port";
import { OrderId } from "src/modules/order/domain/value-objects/order-id.vo";
import { OrderStatusEnum } from "src/modules/order/domain/value-objects/order-status.vo";
import { CancelOrderCommand } from "./cancel-order.command";

/**
 * CancelOrderHandler handles the cancellation of an order
 * Rolls back inventory if order was confirmed/paid/shipped
 */
@CommandHandler(CancelOrderCommand)
export class CancelOrderHandler
  implements ICommandHandler<CancelOrderCommand, void>
{
  constructor(
    @Inject(OrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
    @Inject(InventoryServicePortToken)
    private readonly inventoryService: IInventoryServicePort,
  ) {}

  /**
   * Executes the cancel order command
   * @param command - CancelOrderCommand containing order ID
   * @returns Promise that resolves when cancellation is complete
   * @throws NotFoundError if order does not exist
   */
  async execute(command: CancelOrderCommand): Promise<void> {
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

    // Check if order can be cancelled
    if (!order.getStatus().canBeCancelled()) {
      throw new Error(
        `Cannot cancel order with status: ${order.getStatus().getValue()}`,
      );
    }

    // Rollback inventory if order was confirmed/paid/shipped
    const status = order.getStatus().getValue();
    if (
      status === OrderStatusEnum.CONFIRMED ||
      status === OrderStatusEnum.PAID ||
      status === OrderStatusEnum.SHIPPED
    ) {
      // Increase inventory back for each item
      const items = order.getItems();
      for (const item of items) {
        await this.inventoryService.increaseInventory(
          item.getProductId().getValue(),
          item.getQuantity(),
        );
      }
    }

    // Cancel order
    order.cancel();

    // Save order
    await this.orderRepository.save(order);
  }
}

