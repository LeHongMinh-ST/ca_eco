import { User } from "src/modules/user/domain/entities/user.entity";

/**
 * UserDto represents the user data transfer object
 * Used for returning user data from queries
 * Note: Password is never included in DTO for security reasons
 */
export class UserDto {
  readonly id: string;
  readonly email: string;
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

