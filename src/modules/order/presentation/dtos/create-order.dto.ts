import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

/**
 * CreateOrderDto represents the request DTO for creating an order from cart
 */
export class CreateOrderDto {
  @ApiProperty({
    description: "Cart ID (UUID) to create order from",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  readonly cartId: string;
}

