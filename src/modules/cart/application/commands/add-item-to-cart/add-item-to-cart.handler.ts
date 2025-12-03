import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { NotFoundError } from "src/shared/domain/errors/not-found.error";
import type { ICartRepository } from "src/modules/cart/domain/repositories/cart.repository.interface";
import { CartRepositoryToken } from "src/modules/cart/domain/repositories/cart.repository.interface";
import type { IProductServicePort } from "src/modules/cart/domain/services/product-service.port";
import { ProductServicePortToken } from "src/modules/cart/domain/services/product-service.port";
import { CartId } from "src/modules/cart/domain/value-objects/cart-id.vo";
import { CartItemId } from "src/modules/cart/domain/value-objects/cart-item-id.vo";
import { CartQuantity } from "src/modules/cart/domain/value-objects/cart-quantity.vo";
import { ProductSnapshot } from "src/modules/cart/domain/value-objects/product-snapshot.vo";
import { AddItemToCartCommand } from "./add-item-to-cart.command";

/**
 * AddItemToCartHandler handles adding an item to cart
 */
@CommandHandler(AddItemToCartCommand)
export class AddItemToCartHandler implements ICommandHandler<
  AddItemToCartCommand,
  void
> {
  constructor(
    @Inject(CartRepositoryToken)
    private readonly cartRepository: ICartRepository,
    @Inject(ProductServicePortToken)
    private readonly productService: IProductServicePort,
  ) {}

  /**
   * Executes the add item to cart command
   * @param command - AddItemToCartCommand containing cart ID, product ID and quantity
   * @returns Promise that resolves when item is added
   * @throws NotFoundError if cart or product does not exist
   */
  async execute(command: AddItemToCartCommand): Promise<void> {
    const cartId = CartId.create(command.cartId);

    // Find cart
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) {
      throw new NotFoundError("Cart not found", "cartId", cartId.getValue());
    }

    // Get product information from product service (port/adapter pattern)
    const productInfo = await this.productService.getProductInfo(
      command.productId,
    );
    if (!productInfo) {
      throw new NotFoundError(
        "Product not found",
        "productId",
        command.productId,
      );
    }

    // Create value objects
    const itemId = CartItemId.create(crypto.randomUUID());
    const productSnapshot = new ProductSnapshot(
      productInfo.id,
      productInfo.name,
      productInfo.price,
      productInfo.image,
    );
    const quantity = CartQuantity.create(command.quantity);

    // Add item to cart
    cart.addItem(itemId, productSnapshot, quantity);

    // Save cart
    await this.cartRepository.save(cart);
  }
}
