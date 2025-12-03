import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from "class-validator";

/**
 * CreateUserDto represents the request DTO for creating a user
 */
export class CreateUserDto {
  @ApiProperty({
    description: "User email address",
    example: "john.doe@example.com",
    format: "email",
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    description: "User full name",
    example: "John Doe",
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  readonly name: string;

  @ApiProperty({
    description: "User password (minimum 8 characters)",
    example: "SecurePassword123!",
    minLength: 8,
    maxLength: 255,
    writeOnly: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  readonly password: string;
}
