import { ApiProperty } from "@nestjs/swagger";
import { Order } from "src/modules/order/domain/entities/order.entity";
import { OrderItemDto } from "./order-item.dto";
import { OrderStatusEnum } from "src/modules/order/domain/value-objects/order-status.vo";

/**
 * OrderDto represents order data for API responses
 */
export class OrderDto {
  @ApiProperty({
    example: "order-id-uuid",
    description: "Unique ID of the order",
  })
  readonly id: string;

  @ApiProperty({
    example: "user-id-uuid",
    description: "ID of the user who placed the order",
  })
  readonly userId: string;

  @ApiProperty({
    type: [OrderItemDto],
    description: "List of items in the order",
  })
  readonly items: OrderItemDto[];

  @ApiProperty({
    enum: OrderStatusEnum,
    example: OrderStatusEnum.PENDING,
    description: "Current status of the order",
  })
  readonly status: OrderStatusEnum;

  @ApiProperty({
    example: 350.0,
    description: "Total price of all items in the order",
  })
  readonly totalPrice: number;

  @ApiProperty({
    example: "2025-12-03T10:00:00.000Z",
    description: "Date when the order was created",
  })
  readonly createdAt: Date;

  @ApiProperty({
    example: "2025-12-03T10:00:00.000Z",
    description: "Date when the order was last updated",
  })
  readonly updatedAt: Date;

  constructor(
    id: string,
    userId: string,
    items: OrderItemDto[],
    status: OrderStatusEnum,
    totalPrice: number,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.userId = userId;
    this.items = items;
    this.status = status;
    this.totalPrice = totalPrice;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Creates OrderDto from domain Order entity
   */
  static fromEntity(order: Order): OrderDto {
    return new OrderDto(
      order.getId().getValue(),
      order.getUserId().getValue(),
      order.getItems().map((item) => OrderItemDto.fromValueObject(item)),
      order.getStatus().getValue(),
      order.getTotalPrice(),
      order.getCreatedAt(),
      order.getUpdatedAt(),
    );
  }
}

