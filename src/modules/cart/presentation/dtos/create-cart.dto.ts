import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsUUID } from "class-validator";

/**
 * CreateCartDto represents the request DTO for creating a cart
 */
export class CreateCartDto {
  @ApiProperty({
    description: "User ID (UUID) who owns the cart",
    example: "123e4567-e89b-12d3-a456-426614174000",
    format: "uuid",
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  readonly userId: string;
}
