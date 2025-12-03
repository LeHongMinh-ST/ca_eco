import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";
import type { IUserRepository } from "src/modules/user/domain/repositories/user.repository.interface";
import { UserRepositoryToken } from "src/modules/user/domain/repositories/user.repository.interface";
import { User } from "src/modules/user/domain/entities/user.entity";
import { UserId } from "src/modules/user/domain/value-objects/user-id.vo";
import { UserEmail } from "src/modules/user/domain/value-objects/user-email.vo";
import { UserName } from "src/modules/user/domain/value-objects/user-name.vo";
import { UserPassword } from "src/modules/user/domain/value-objects/user-password.vo";
import { CreateUserCommand } from "./create-user.command";
import { CreateUserResult } from "./create-user.result";

/**
 * CreateUserHandler handles the creation of a new user
 */
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<
  CreateUserCommand,
  CreateUserResult
> {
  constructor(
    @Inject(UserRepositoryToken)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Executes the create user command
   * @param command - CreateUserCommand containing user data
   * @returns Promise that resolves to CreateUserResult with created user ID
   * @throws InvalidInputError if email already exists
   */
  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
    // Create value objects
    const email = UserEmail.create(command.email);

    // Check if user with this email already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new InvalidInputError(
        "User with this email already exists",
        "email",
        command.email,
      );
    }

    // Generate new user ID
    const userId = UserId.create(crypto.randomUUID());

    // Create value objects
    const name = UserName.create(command.name);
    // Note: Password should be hashed in infrastructure layer before creating UserPassword
    // For now, we'll create it directly - infrastructure layer will handle hashing
    const password = UserPassword.create(command.password);

    // Create user entity
    const user = User.create(userId, email, name, password);

    // Save user
    await this.userRepository.save(user);

    return new CreateUserResult(userId.getValue());
  }
}

