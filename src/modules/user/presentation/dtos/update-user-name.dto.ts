import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, MinLength, MaxLength } from "class-validator";

/**
 * UpdateUserNameDto represents the request DTO for updating user name
 */
export class UpdateUserNameDto {
  @ApiProperty({
    description: "New user full name",
    example: "Jane Doe",
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  readonly name: string;
}
