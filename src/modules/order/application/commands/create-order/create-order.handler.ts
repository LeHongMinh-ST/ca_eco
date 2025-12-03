import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { NotFoundError } from "src/shared/domain/errors/not-found.error";
import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";
import type { IOrderRepository } from "src/modules/order/domain/repositories/order.repository.interface";
import { OrderRepositoryToken } from "src/modules/order/domain/repositories/order.repository.interface";
import type { ICartServicePort } from "src/modules/order/domain/services/cart-service.port";
import { CartServicePortToken } from "src/modules/order/domain/services/cart-service.port";
import { Order } from "src/modules/order/domain/entities/order.entity";
import { OrderId } from "src/modules/order/domain/value-objects/order-id.vo";
import { OrderItem } from "src/modules/order/domain/value-objects/order-item.vo";
import { UserId } from "src/modules/cart/domain/value-objects/user-id.vo";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
import { CreateOrderCommand } from "./create-order.command";
import { CreateOrderResult } from "./create-order.result";

/**
 * CreateOrderHandler handles the creation of a new order from cart
 */
@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<
  CreateOrderCommand,
  CreateOrderResult
> {
  constructor(
    @Inject(OrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
    @Inject(CartServicePortToken)
    private readonly cartService: ICartServicePort,
  ) {}

  /**
   * Executes the create order command
   * Creates order with PENDING status, cart will be cleared after order is confirmed
   * @param command - CreateOrderCommand containing cart ID
   * @returns Promise that resolves to CreateOrderResult with created order ID
   * @throws NotFoundError if cart not found
   * @throws InvalidInputError if cart is empty
   */
  async execute(command: CreateOrderCommand): Promise<CreateOrderResult> {
    // Get cart information
    const cartInfo = await this.cartService.getCartById(command.cartId);
    if (!cartInfo) {
      throw new NotFoundError("Cart not found", "cartId", command.cartId);
    }

    // Validate cart is not empty
    if (!cartInfo.items || cartInfo.items.length === 0) {
      throw new InvalidInputError(
        "Cannot create order from empty cart",
        "cartId",
        command.cartId,
      );
    }

    // Generate new order ID
    const orderId = OrderId.create(crypto.randomUUID());

    // Convert cart items to order items
    const orderItems = cartInfo.items.map((item) =>
      OrderItem.create(
        ProductId.create(item.productId),
        item.productName,
        item.productPrice,
        item.quantity,
      ),
    );

    // Create order entity with source cart ID
    const userId = UserId.create(cartInfo.userId);
    const order = Order.create(orderId, userId, orderItems, command.cartId);

    // Save order
    await this.orderRepository.save(order);

    // Clear cart immediately after order creation
    await this.cartService.clearCart(command.cartId);

    return new CreateOrderResult(orderId.getValue());
  }
}

