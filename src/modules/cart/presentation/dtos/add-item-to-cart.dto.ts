import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  Min,
  IsInt,
} from "class-validator";

/**
 * AddItemToCartDto represents the request DTO for adding an item to cart
 */
export class AddItemToCartDto {
  @ApiProperty({
    description: "Product ID (UUID) to add to cart",
    example: "223e4567-e89b-12d3-a456-426614174001",
    format: "uuid",
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  readonly productId: string;

  @ApiProperty({
    description: "Quantity of the product to add",
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  readonly quantity: number;
}
