import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsInt, Min, IsNotEmpty } from "class-validator";

/**
 * UpdateItemQuantityDto represents the request DTO for updating cart item quantity
 */
export class UpdateItemQuantityDto {
  @ApiProperty({
    description: "New quantity for the cart item",
    example: 3,
    minimum: 1,
  })
  @IsNumber()
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  readonly quantity: number;
}
