import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/modules/user/domain/entities/user.entity";

/**
 * UserDto represents the user data transfer object
 * Used for returning user data from queries
 * Note: Password is never included in DTO for security reasons
 */
export class UserDto {
  @ApiProperty({
    description: "User ID (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  readonly id: string;

  @ApiProperty({
    description: "User email address",
    example: "john.doe@example.com",
  })
  readonly email: string;

  @ApiProperty({
    description: "User full name",
    example: "John Doe",
  })
  readonly name: string;

  constructor(id: string, email: string, name: string) {
    this.id = id;
    this.email = email;
    this.name = name;
  }

  /**
   * Creates UserDto from User entity
   * @param user - User entity
   * @returns UserDto instance
   */
  static fromEntity(user: User): UserDto {
    return new UserDto(
      user.getId().getValue(),
      user.getEmail().getValue(),
      user.getName().getValue(),
    );
  }
}

