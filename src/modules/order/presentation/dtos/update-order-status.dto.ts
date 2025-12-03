import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { OrderStatusEnum } from "src/modules/order/domain/value-objects/order-status.vo";

/**
 * UpdateOrderStatusDto represents the request DTO for updating order status
 */
export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatusEnum,
    description: "New status for the order",
    example: OrderStatusEnum.CONFIRMED,
  })
  @IsEnum(OrderStatusEnum)
  readonly status: OrderStatusEnum;
}

