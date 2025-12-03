import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { NotFoundError } from "src/shared/domain/errors/not-found.error";
import type { IUserRepository } from "src/modules/user/domain/repositories/user.repository.interface";
import { UserRepositoryToken } from "src/modules/user/domain/repositories/user.repository.interface";
import { UserId } from "src/modules/user/domain/value-objects/user-id.vo";
import { UserPassword } from "src/modules/user/domain/value-objects/user-password.vo";
import { UpdateUserPasswordCommand } from "./update-user-password.command";

/**
 * UpdateUserPasswordHandler handles the update of user password
 */
@CommandHandler(UpdateUserPasswordCommand)
export class UpdateUserPasswordHandler implements ICommandHandler<
  UpdateUserPasswordCommand,
  void
> {
  constructor(
    @Inject(UserRepositoryToken)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Executes the update user password command
   * @param command - UpdateUserPasswordCommand containing user ID and new password (should be hashed)
   * @returns Promise that resolves when update is complete
   * @throws NotFoundError if user does not exist
   */
  async execute(command: UpdateUserPasswordCommand): Promise<void> {
    const userId = UserId.create(command.userId);

    // Find existing user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(
        "User not found",
        "userId",
        userId.getValue(),
      );
    }

    // Update password
    // Note: Password should be hashed in infrastructure layer before creating UserPassword
    const password = UserPassword.create(command.password);
    user.updatePassword(password);

    // Save updated user
    await this.userRepository.save(user);
  }
}

