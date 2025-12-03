import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, MinLength, MaxLength } from "class-validator";

/**
 * UpdateUserPasswordDto represents the request DTO for updating user password
 * Note: Password should be hashed before saving to database
 */
export class UpdateUserPasswordDto {
  @ApiProperty({
    description: "New password (minimum 8 characters)",
    example: "NewSecurePassword123!",
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
