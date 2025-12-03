import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEmail, IsNotEmpty } from "class-validator";

/**
 * UpdateUserEmailDto represents the request DTO for updating user email
 */
export class UpdateUserEmailDto {
  @ApiProperty({
    description: "New email address",
    example: "newemail@example.com",
    format: "email",
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}
