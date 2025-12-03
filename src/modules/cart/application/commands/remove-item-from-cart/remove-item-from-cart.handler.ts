import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { NotFoundError } from "src/shared/domain/errors/not-found.error";
import type { ICartRepository } from "src/modules/cart/domain/repositories/cart.repository.interface";
import { CartRepositoryToken } from "src/modules/cart/domain/repositories/cart.repository.interface";
import { CartId } from "src/modules/cart/domain/value-objects/cart-id.vo";
import { CartItemId } from "src/modules/cart/domain/value-objects/cart-item-id.vo";
import { RemoveItemFromCartCommand } from "./remove-item-from-cart.command";

/**
 * RemoveItemFromCartHandler handles removing an item from cart
 */
@CommandHandler(RemoveItemFromCartCommand)
export class RemoveItemFromCartHandler implements ICommandHandler<
  RemoveItemFromCartCommand,
  void
> {
  constructor(
    @Inject(CartRepositoryToken)
    private readonly cartRepository: ICartRepository,
  ) {}

  /**
   * Executes the remove item from cart command
   * @param command - RemoveItemFromCartCommand containing cart ID and item ID
   * @returns Promise that resolves when item is removed
   * @throws NotFoundError if cart does not exist
   */
  async execute(command: RemoveItemFromCartCommand): Promise<void> {
    const cartId = CartId.create(command.cartId);

    // Find cart
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) {
      throw new NotFoundError("Cart not found", "cartId", cartId.getValue());
    }

    // Create value object
    const itemId = CartItemId.create(command.itemId);

    // Remove item from cart
    cart.removeItem(itemId);

    // Save cart
    await this.cartRepository.save(cart);
  }
}
