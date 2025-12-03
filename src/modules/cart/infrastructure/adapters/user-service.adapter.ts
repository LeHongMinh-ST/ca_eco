import { Injectable } from "@nestjs/common";
import {
  IUserServicePort,
  UserInfo,
} from "../../domain/services/user-service.port";
// Note: Cần tạo UserRepositoryToken trong User module nếu chưa có
// import type { IUserRepository } from "src/modules/user/domain/repositories/user.repository.interface";
// import { UserRepositoryToken } from "src/modules/user/domain/repositories/user.repository.interface";
// import { UserId as UserDomainUserId } from "src/modules/user/domain/value-objects/user-id.vo";

/**
 * UserServiceAdapter implements IUserServicePort
 * This is an adapter in Hexagonal Architecture pattern
 * Adapts UserRepository from User module to Cart module's port interface
 */
@Injectable()
export class UserServiceAdapter implements IUserServicePort {
  constructor() {
    // Inject UserRepository khi User module có repository
    // @Inject(UserRepositoryToken)
    // private readonly userRepository: IUserRepository,
  }

  /**
   * Validates if a user exists
   * @param _userId - User identifier string (unused in temporary implementation)
   * @returns Promise that resolves to true if user exists, false otherwise
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userExists(_userId: string): Promise<boolean> {
    // TODO: Implement when UserRepository is available
    // const id = UserDomainUserId.create(userId);
    // const user = await this.userRepository.findById(id);
    // return user !== undefined;

    // Temporary: Always return true for now
    // In production, this should call UserRepository
    return Promise.resolve(true);
  }

  /**
   * Gets user information by user ID
   * @param userId - User identifier string
   * @returns Promise that resolves to UserInfo or undefined if not found
   */
  getUserInfo(userId: string): Promise<UserInfo | undefined> {
    // TODO: Implement when UserRepository is available
    // const id = UserDomainUserId.create(userId);
    // const user = await this.userRepository.findById(id);
    // if (!user) {
    //   return undefined;
    // }
    // return {
    //   id: user.getId().getValue(),
    //   email: user.getEmail()?.getValue(),
    //   name: user.getName()?.getValue(),
    // };

    // Temporary: Return basic info
    return Promise.resolve({
      id: userId,
    });
  }
}
