import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { NotFoundError } from "src/shared/domain/errors/not-found.error";
import type { IUserRepository } from "src/modules/user/domain/repositories/user.repository.interface";
import { UserRepositoryToken } from "src/modules/user/domain/repositories/user.repository.interface";
import { UserId } from "src/modules/user/domain/value-objects/user-id.vo";
import { GetUserByIdQuery } from "./get-user-by-id.query";
import { UserDto } from "../dtos/user.dto";

/**
 * GetUserByIdHandler handles the query to get a user by ID
 */
@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<
  GetUserByIdQuery,
  UserDto
> {
  constructor(
    @Inject(UserRepositoryToken)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Executes the get user by ID query
   * @param query - GetUserByIdQuery containing user ID
   * @returns Promise that resolves to UserDto
   * @throws NotFoundError if user does not exist
   */
  async execute(query: GetUserByIdQuery): Promise<UserDto> {
    const userId = UserId.create(query.userId);

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(
        "User not found",
        "userId",
        userId.getValue(),
      );
    }

    return UserDto.fromEntity(user);
  }
}

