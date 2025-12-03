import { User } from "../entities/user.entity";
import { UserId } from "../value-objects/user-id.vo";
import { UserEmail } from "../value-objects/user-email.vo";

/**
 * UserRepository interface defines contract for user persistence
 * Implementation should be provided in infrastructure layer
 */
export interface IUserRepository {
  /**
   * Saves a user entity
   * Creates new user if not exists, updates if exists
   * @param user - User entity to save
   * @returns Promise that resolves when save is complete
   */
  save(user: User): Promise<void>;

  /**
   * Finds a user by its ID
   * @param id - User identifier
   * @returns Promise that resolves to User entity or undefined if not found
   */
  findById(id: UserId): Promise<User | undefined>;

  /**
   * Finds a user by email
   * @param email - User email
   * @returns Promise that resolves to User entity or undefined if not found
   */
  findByEmail(email: UserEmail): Promise<User | undefined>;

  /**
   * Checks if a user exists by ID
   * @param id - User identifier
   * @returns Promise that resolves to true if user exists, false otherwise
   */
  exists(id: UserId): Promise<boolean>;

  /**
   * Checks if a user exists by email
   * @param email - User email
   * @returns Promise that resolves to true if user exists, false otherwise
   */
  existsByEmail(email: UserEmail): Promise<boolean>;

  /**
   * Deletes a user by ID
   * @param id - User identifier
   * @returns Promise that resolves when deletion is complete
   */
  delete(id: UserId): Promise<void>;
}

export const UserRepositoryToken = "IUserRepository";
