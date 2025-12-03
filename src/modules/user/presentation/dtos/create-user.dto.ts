/**
 * CreateUserDto represents the request DTO for creating a user
 */
export class CreateUserDto {
  readonly email: string;
  readonly name: string;
  readonly password: string;
}

