/**
 * UpdateUserPasswordDto represents the request DTO for updating user password
 * Note: Password should be hashed before saving to database
 */
export class UpdateUserPasswordDto {
  readonly password: string;
}

