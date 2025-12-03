import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import type { IOrderRepository } from "src/modules/order/domain/repositories/order.repository.interface";
import { OrderRepositoryToken } from "src/modules/order/domain/repositories/order.repository.interface";
import { UserId } from "src/modules/cart/domain/value-objects/user-id.vo";
import { GetOrdersByUserIdQuery } from "./get-orders-by-user-id.query";
import { OrderDto } from "../dtos/order.dto";

/**
 * GetOrdersByUserIdHandler handles the query to get orders by user ID
 */
@QueryHandler(GetOrdersByUserIdQuery)
export class GetOrdersByUserIdHandler
  implements IQueryHandler<GetOrdersByUserIdQuery, OrderDto[]>
{
  constructor(
    @Inject(OrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
  ) {}

  /**
   * Executes the get orders by user ID query
   * @param query - GetOrdersByUserIdQuery containing user ID
   * @returns Promise that resolves to array of OrderDto
   */
  async execute(query: GetOrdersByUserIdQuery): Promise<OrderDto[]> {
    const userId = UserId.create(query.userId);

    const orders = await this.orderRepository.findByUserId(userId);

    return orders.map((order) => OrderDto.fromEntity(order));
  }
}

