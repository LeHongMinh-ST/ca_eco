import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";
import type { ICartRepository } from "src/modules/cart/domain/repositories/cart.repository.interface";
import { CartRepositoryToken } from "src/modules/cart/domain/repositories/cart.repository.interface";
import type { IUserServicePort } from "src/modules/cart/domain/services/user-service.port";
import { UserServicePortToken } from "src/modules/cart/domain/services/user-service.port";
import { Cart } from "src/modules/cart/domain/entities/cart.entity";
import { CartId } from "src/modules/cart/domain/value-objects/cart-id.vo";
import { UserId } from "src/modules/cart/domain/value-objects/user-id.vo";
import { CreateCartCommand } from "./create-cart.command";
import { CreateCartResult } from "./create-cart.result";

/**
 * CreateCartHandler handles the creation of a new cart
 */
@CommandHandler(CreateCartCommand)
export class CreateCartHandler implements ICommandHandler<
  CreateCartCommand,
  CreateCartResult
> {
  constructor(
    @Inject(CartRepositoryToken)
    private readonly cartRepository: ICartRepository,
    @Inject(UserServicePortToken)
    private readonly userService: IUserServicePort,
  ) {}

  /**
   * Executes the create cart command
   * @param command - CreateCartCommand containing user ID
   * @returns Promise that resolves to CreateCartResult with created cart ID
   * @throws InvalidInputError if user does not exist
   */
  async execute(command: CreateCartCommand): Promise<CreateCartResult> {
    // Validate user exists through port
    const userExists = await this.userService.userExists(command.userId);
    if (!userExists) {
      throw new InvalidInputError("User not found", "userId", command.userId);
    }

    const userId = UserId.create(command.userId);

    // Check if cart already exists for this user
    const existingCart = await this.cartRepository.findByUserId(userId);
    if (existingCart) {
      return new CreateCartResult(existingCart.getId().getValue());
    }

    // Generate new cart ID
    const cartId = CartId.create(crypto.randomUUID());

    // Create cart entity
    const cart = Cart.create(cartId, userId);

    // Save cart
    await this.cartRepository.save(cart);

    return new CreateCartResult(cartId.getValue());
  }
}
