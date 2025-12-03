/**
 * UserServicePort defines the interface for user-related operations
 * This is a domain service port in Hexagonal Architecture pattern
 * Implementation will be provided in infrastructure layer as adapter
 */
export interface IUserServicePort {
  /**
   * Validates if a user exists
   * @param userId - User identifier string
   * @returns Promise that resolves to true if user exists, false otherwise
   */
  userExists(userId: string): Promise<boolean>;

  /**
   * Gets user information by user ID
   * @param userId - User identifier string
   * @returns Promise that resolves to user information or undefined if not found
   */
  getUserInfo(userId: string): Promise<UserInfo | undefined>;
}

/**
 * UserInfo represents the user information needed for cart
 */
export interface UserInfo {
  readonly id: string;
  readonly email?: string;
  readonly name?: string;
}

export const UserServicePortToken = "IUserServicePort";

