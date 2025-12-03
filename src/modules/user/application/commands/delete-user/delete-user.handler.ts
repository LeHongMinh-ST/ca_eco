import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { NotFoundError } from "src/shared/domain/errors/not-found.error";
import type { IUserRepository } from "src/modules/user/domain/repositories/user.repository.interface";
import { UserRepositoryToken } from "src/modules/user/domain/repositories/user.repository.interface";
import { UserId } from "src/modules/user/domain/value-objects/user-id.vo";
import { DeleteUserCommand } from "./delete-user.command";

/**
 * DeleteUserHandler handles the deletion of a user
 */
@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<
  DeleteUserCommand,
  void
> {
  constructor(
    @Inject(UserRepositoryToken)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Executes the delete user command
   * @param command - DeleteUserCommand containing user ID
   * @returns Promise that resolves when deletion is complete
   * @throws NotFoundError if user does not exist
   */
  async execute(command: DeleteUserCommand): Promise<void> {
    const userId = UserId.create(command.userId);

    // Check if user exists
    const exists = await this.userRepository.exists(userId);
    if (!exists) {
      throw new NotFoundError(
        "User not found",
        "userId",
        userId.getValue(),
      );
    }

    // Delete user
    await this.userRepository.delete(userId);
  }
}

