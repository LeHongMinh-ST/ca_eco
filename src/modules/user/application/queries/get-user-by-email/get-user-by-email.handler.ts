import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { NotFoundError } from "src/shared/domain/errors/not-found.error";
import type { IUserRepository } from "src/modules/user/domain/repositories/user.repository.interface";
import { UserRepositoryToken } from "src/modules/user/domain/repositories/user.repository.interface";
import { UserEmail } from "src/modules/user/domain/value-objects/user-email.vo";
import { GetUserByEmailQuery } from "./get-user-by-email.query";
import { UserDto } from "../dtos/user.dto";

/**
 * GetUserByEmailHandler handles the query to get a user by email
 */
@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<
  GetUserByEmailQuery,
  UserDto
> {
  constructor(
    @Inject(UserRepositoryToken)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Executes the get user by email query
   * @param query - GetUserByEmailQuery containing user email
   * @returns Promise that resolves to UserDto
   * @throws NotFoundError if user does not exist
   */
  async execute(query: GetUserByEmailQuery): Promise<UserDto> {
    const email = UserEmail.create(query.email);

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError(
        "User not found",
        "email",
        email.getValue(),
      );
    }

    return UserDto.fromEntity(user);
  }
}

