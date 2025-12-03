import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { NotFoundError } from "src/shared/domain/errors/not-found.error";
import type { ICartRepository } from "src/modules/cart/domain/repositories/cart.repository.interface";
import { CartRepositoryToken } from "src/modules/cart/domain/repositories/cart.repository.interface";
import { CartId } from "src/modules/cart/domain/value-objects/cart-id.vo";
import { ClearCartCommand } from "./clear-cart.command";

/**
 * ClearCartHandler handles clearing all items from cart
 */
@CommandHandler(ClearCartCommand)
export class ClearCartHandler implements ICommandHandler<
  ClearCartCommand,
  void
> {
  constructor(
    @Inject(CartRepositoryToken)
    private readonly cartRepository: ICartRepository,
  ) {}

  /**
   * Executes the clear cart command
   * @param command - ClearCartCommand containing cart ID
   * @returns Promise that resolves when cart is cleared
   * @throws NotFoundError if cart does not exist
   */
  async execute(command: ClearCartCommand): Promise<void> {
    const cartId = CartId.create(command.cartId);

    // Find cart
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) {
      throw new NotFoundError("Cart not found", "cartId", cartId.getValue());
    }

    // Clear cart
    cart.clear();

    // Save cart
    await this.cartRepository.save(cart);
  }
}
