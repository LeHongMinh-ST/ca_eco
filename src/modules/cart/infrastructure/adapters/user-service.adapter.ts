import { Injectable, Inject, Optional } from "@nestjs/common";
import {
  IUserServicePort,
  UserInfo,
} from "../../domain/services/user-service.port";
import type { IUserRepository } from "src/modules/user/domain/repositories/user.repository.interface";
import { UserRepositoryToken } from "src/modules/user/domain/repositories/user.repository.interface";
import { UserId } from "src/modules/user/domain/value-objects/user-id.vo";

/**
 * UserServiceAdapter implements IUserServicePort
 * This is an adapter in Hexagonal Architecture pattern
 * Adapts UserRepository from User module to Cart module's port interface
 */
@Injectable()
export class UserServiceAdapter implements IUserServicePort {
  constructor(
    @Optional()
    @Inject(UserRepositoryToken)
    private readonly userRepository?: IUserRepository,
  ) {}

  /**
   * Validates if a user exists
   * @param userId - User identifier string
   * @returns Promise that resolves to true if user exists, false otherwise
   */
  async userExists(userId: string): Promise<boolean> {
    if (!this.userRepository) {
      // Fallback: return true if repository is not available
      // This allows cart module to work even if user infrastructure is not ready
      return true;
    }

    try {
      const id = UserId.create(userId);
      const user = await this.userRepository.findById(id);
      return user !== undefined;
    } catch {
      // If user ID is invalid, user doesn't exist
      return false;
    }
  }

  /**
   * Gets user information by user ID
   * @param userId - User identifier string
   * @returns Promise that resolves to UserInfo or undefined if not found
   */
  async getUserInfo(userId: string): Promise<UserInfo | undefined> {
    if (!this.userRepository) {
      // Fallback: return basic info if repository is not available
      return {
        id: userId,
      };
    }

    try {
      const id = UserId.create(userId);
      const user = await this.userRepository.findById(id);

      if (!user) {
        return undefined;
      }

      return {
        id: user.getId().getValue(),
        email: user.getEmail().getValue(),
        name: user.getName().getValue(),
      };
    } catch {
      // If user ID is invalid or error occurs, return undefined
      return undefined;
    }
  }
}
