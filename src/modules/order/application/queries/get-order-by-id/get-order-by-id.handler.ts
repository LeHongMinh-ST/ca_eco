import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { NotFoundError } from "src/shared/domain/errors/not-found.error";
import type { IOrderRepository } from "src/modules/order/domain/repositories/order.repository.interface";
import { OrderRepositoryToken } from "src/modules/order/domain/repositories/order.repository.interface";
import { OrderId } from "src/modules/order/domain/value-objects/order-id.vo";
import { GetOrderByIdQuery } from "./get-order-by-id.query";
import { OrderDto } from "../dtos/order.dto";

/**
 * GetOrderByIdHandler handles the query to get an order by ID
 */
@QueryHandler(GetOrderByIdQuery)
export class GetOrderByIdHandler
  implements IQueryHandler<GetOrderByIdQuery, OrderDto>
{
  constructor(
    @Inject(OrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
  ) {}

  /**
   * Executes the get order by ID query
   * @param query - GetOrderByIdQuery containing order ID
   * @returns Promise that resolves to OrderDto
   * @throws NotFoundError if order does not exist
   */
  async execute(query: GetOrderByIdQuery): Promise<OrderDto> {
    const orderId = OrderId.create(query.orderId);

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError(
        "Order not found",
        "orderId",
        orderId.getValue(),
      );
    }

    return OrderDto.fromEntity(order);
  }
}

