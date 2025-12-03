import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsUrl, Min, IsOptional } from "class-validator";

/**
 * UpdateProductDto represents the request DTO for updating a product
 */
export class UpdateProductDto {
  @ApiProperty({
    description: "Product name",
    example: "iPhone 15 Pro Max",
    minLength: 1,
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly name?: string;

  @ApiProperty({
    description: "Product price in VND",
    example: 29990000,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  readonly price?: number;

  @ApiProperty({
    description: "Product image URL",
    example: "https://example.com/images/iphone-15-pro-max.jpg",
    maxLength: 2048,
    required: false,
  })
  @IsString()
  @IsUrl()
  @IsOptional()
  readonly image?: string;
}
