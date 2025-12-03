import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiParam,
} from "@nestjs/swagger";
import { CreateOrderCommand } from "../../application/commands/create-order/create-order.command";
import { CreateOrderResult } from "../../application/commands/create-order/create-order.result";
import { CancelOrderCommand } from "../../application/commands/cancel-order/cancel-order.command";
import { UpdateOrderStatusCommand } from "../../application/commands/update-order-status/update-order-status.command";
import { GetOrderByIdQuery } from "../../application/queries/get-order-by-id/get-order-by-id.query";
import { GetOrdersByUserIdQuery } from "../../application/queries/get-orders-by-user-id/get-orders-by-user-id.query";
import { OrderDto } from "../../application/queries/dtos/order.dto";
import { CreateOrderDto } from "../dtos/create-order.dto";
import { UpdateOrderStatusDto } from "../dtos/update-order-status.dto";
import { OrderStatusEnum } from "../../domain/value-objects/order-status.vo";

@ApiTags("orders")
@Controller("orders")
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new order from cart" })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: "Order created successfully",
    schema: { example: { orderId: "123e4567-e89b-12d3-a456-426614174000" } },
  })
  @ApiResponse({ status: 400, description: "Bad request - validation failed" })
  @ApiResponse({ status: 404, description: "Cart not found or empty" })
  async create(
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<CreateOrderResult> {
    this.logger.log(`Creating order from cart: ${createOrderDto.cartId}`);
    const command = new CreateOrderCommand(createOrderDto.cartId);
    const result = await this.commandBus.execute<
      CreateOrderCommand,
      CreateOrderResult
    >(command);
    this.logger.log(`Order created successfully: ${result.orderId}`);
    return result;
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an order by ID" })
  @ApiParam({
    name: "id",
    description: "ID of the order (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Order found",
    type: OrderDto,
  })
  @ApiResponse({ status: 404, description: "Order not found" })
  async findById(@Param("id") id: string): Promise<OrderDto> {
    this.logger.log(`Fetching order by ID: ${id}`);
    const query = new GetOrderByIdQuery(id);
    return await this.queryBus.execute<GetOrderByIdQuery, OrderDto>(query);
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Get orders by user ID" })
  @ApiParam({
    name: "userId",
    description: "ID of the user (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Orders found for user",
    type: [OrderDto],
  })
  @ApiResponse({ status: 400, description: "Invalid user ID" })
  async findByUserId(@Param("userId") userId: string): Promise<OrderDto[]> {
    this.logger.log(`Fetching orders by userId: ${userId}`);
    const query = new GetOrdersByUserIdQuery(userId);
    return await this.queryBus.execute<GetOrdersByUserIdQuery, OrderDto[]>(
      query,
    );
  }

  @Post(":id/cancel")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cancel an order" })
  @ApiParam({
    name: "id",
    description: "ID of the order (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({ status: 200, description: "Order cancelled successfully" })
  @ApiResponse({ status: 400, description: "Order cannot be cancelled" })
  @ApiResponse({ status: 404, description: "Order not found" })
  async cancel(@Param("id") id: string): Promise<void> {
    this.logger.log(`Cancelling order: ${id}`);
    const command = new CancelOrderCommand(id);
    await this.commandBus.execute<CancelOrderCommand, void>(command);
    this.logger.log(`Order cancelled successfully: ${id}`);
  }

  @Put(":id/status")
  @ApiOperation({ summary: "Update order status" })
  @ApiParam({
    name: "id",
    description: "ID of the order (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({ status: 200, description: "Order status updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid status transition" })
  @ApiResponse({ status: 404, description: "Order not found" })
  async updateStatus(
    @Param("id") id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ): Promise<void> {
    this.logger.log(
      `Updating order status for order: ${id} to ${updateStatusDto.status}`,
    );
    const command = new UpdateOrderStatusCommand(id, updateStatusDto.status);
    await this.commandBus.execute<UpdateOrderStatusCommand, void>(command);
    this.logger.log(`Order status updated successfully: ${id}`);
  }
}

