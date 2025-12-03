import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { NotFoundError } from "src/shared/domain/errors/not-found.error";
import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";
import type { IUserRepository } from "src/modules/user/domain/repositories/user.repository.interface";
import { UserRepositoryToken } from "src/modules/user/domain/repositories/user.repository.interface";
import { UserId } from "src/modules/user/domain/value-objects/user-id.vo";
import { UserEmail } from "src/modules/user/domain/value-objects/user-email.vo";
import { UpdateUserEmailCommand } from "./update-user-email.command";

/**
 * UpdateUserEmailHandler handles the update of user email
 */
@CommandHandler(UpdateUserEmailCommand)
export class UpdateUserEmailHandler implements ICommandHandler<
  UpdateUserEmailCommand,
  void
> {
  constructor(
    @Inject(UserRepositoryToken)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Executes the update user email command
   * @param command - UpdateUserEmailCommand containing user ID and new email
   * @returns Promise that resolves when update is complete
   * @throws NotFoundError if user does not exist
   * @throws InvalidInputError if email already exists
   */
  async execute(command: UpdateUserEmailCommand): Promise<void> {
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

    // Check if new email already exists (and is different from current email)
    const newEmail = UserEmail.create(command.email);
    if (user.getEmail().getValue() !== newEmail.getValue()) {
      const existingUser = await this.userRepository.findByEmail(newEmail);
      if (existingUser) {
        throw new InvalidInputError(
          "User with this email already exists",
          "email",
          command.email,
        );
      }
    }

    // Update email
    user.updateEmail(newEmail);

    // Save updated user
    await this.userRepository.save(user);
  }
}

