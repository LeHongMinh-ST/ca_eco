import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { NotFoundError } from "src/shared/domain/errors/not-found.error";
import type { IUserRepository } from "src/modules/user/domain/repositories/user.repository.interface";
import { UserRepositoryToken } from "src/modules/user/domain/repositories/user.repository.interface";
import { UserId } from "src/modules/user/domain/value-objects/user-id.vo";
import { UserName } from "src/modules/user/domain/value-objects/user-name.vo";
import { UpdateUserNameCommand } from "./update-user-name.command";

/**
 * UpdateUserNameHandler handles the update of user name
 */
@CommandHandler(UpdateUserNameCommand)
export class UpdateUserNameHandler implements ICommandHandler<
  UpdateUserNameCommand,
  void
> {
  constructor(
    @Inject(UserRepositoryToken)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Executes the update user name command
   * @param command - UpdateUserNameCommand containing user ID and new name
   * @returns Promise that resolves when update is complete
   * @throws NotFoundError if user does not exist
   */
  async execute(command: UpdateUserNameCommand): Promise<void> {
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

    // Update name
    const name = UserName.create(command.name);
    user.updateName(name);

    // Save updated user
    await this.userRepository.save(user);
  }
}

