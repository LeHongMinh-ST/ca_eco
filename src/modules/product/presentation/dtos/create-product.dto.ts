import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsNotEmpty, IsUrl, Min } from "class-validator";

/**
 * CreateProductDto represents the request DTO for creating a product
 */
export class CreateProductDto {
  @ApiProperty({
    description: "Product name",
    example: "iPhone 15 Pro Max",
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    description: "Product price in VND",
    example: 29990000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  readonly price: number;

  @ApiProperty({
    description: "Product image URL",
    example: "https://example.com/images/iphone-15-pro-max.jpg",
    maxLength: 2048,
  })
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  readonly image: string;
}
