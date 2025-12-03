import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { NotFoundError } from "src/shared/domain/errors/not-found.error";
import type { ICartRepository } from "src/modules/cart/domain/repositories/cart.repository.interface";
import { CartRepositoryToken } from "src/modules/cart/domain/repositories/cart.repository.interface";
import { CartId } from "src/modules/cart/domain/value-objects/cart-id.vo";
import { CartItemId } from "src/modules/cart/domain/value-objects/cart-item-id.vo";
import { CartQuantity } from "src/modules/cart/domain/value-objects/cart-quantity.vo";
import { UpdateItemQuantityCommand } from "./update-item-quantity.command";

/**
 * UpdateItemQuantityHandler handles updating cart item quantity
 */
@CommandHandler(UpdateItemQuantityCommand)
export class UpdateItemQuantityHandler implements ICommandHandler<
  UpdateItemQuantityCommand,
  void
> {
  constructor(
    @Inject(CartRepositoryToken)
    private readonly cartRepository: ICartRepository,
  ) {}

  /**
   * Executes the update item quantity command
   * @param command - UpdateItemQuantityCommand containing cart ID, item ID and new quantity
   * @returns Promise that resolves when quantity is updated
   * @throws NotFoundError if cart does not exist
   */
  async execute(command: UpdateItemQuantityCommand): Promise<void> {
    const cartId = CartId.create(command.cartId);

    // Find cart
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) {
      throw new NotFoundError("Cart not found", "cartId", cartId.getValue());
    }

    // Create value objects
    const itemId = CartItemId.create(command.itemId);
    const quantity = CartQuantity.create(command.quantity);

    // Update item quantity
    cart.updateItemQuantity(itemId, quantity);

    // Save cart
    await this.cartRepository.save(cart);
  }
}
