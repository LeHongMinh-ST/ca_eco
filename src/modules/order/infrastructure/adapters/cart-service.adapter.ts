import { Injectable, Inject } from "@nestjs/common";
import {
  ICartServicePort,
  CartInfo,
} from "../../domain/services/cart-service.port";
import type { ICartRepository } from "src/modules/cart/domain/repositories/cart.repository.interface";
import { CartRepositoryToken } from "src/modules/cart/domain/repositories/cart.repository.interface";
import { CartId } from "src/modules/cart/domain/value-objects/cart-id.vo";
import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";

/**
 * CartServiceAdapter implements ICartServicePort
 * This is an adapter in Hexagonal Architecture pattern
 * Adapts CartRepository from Cart module to Order module's port interface
 */
@Injectable()
export class CartServiceAdapter implements ICartServicePort {
  constructor(
    @Inject(CartRepositoryToken)
    private readonly cartRepository: ICartRepository,
  ) {}

  /**
   * Gets cart information by cart ID
   * @param cartId - Cart identifier
   * @returns Promise that resolves to cart info or undefined if not found
   */
  async getCartById(cartId: string): Promise<CartInfo | undefined> {
    try {
      const id = CartId.create(cartId);
      const cart = await this.cartRepository.findById(id);

      if (!cart) {
        return undefined;
      }

      const items = cart.getItems().map((item) => ({
        productId: item.getProductSnapshot().productId,
        productName: item.getProductSnapshot().name,
        productPrice: item.getProductSnapshot().price,
        quantity: item.getQuantity().getValue(),
      }));

      return {
        id: cart.getId().getValue(),
        userId: cart.getUserId().getValue(),
        items,
        totalPrice: cart.getTotalPrice(),
      };
    } catch (error) {
      if (error instanceof InvalidInputError) {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * Clears all items from a cart
   * @param cartId - Cart identifier
   * @returns Promise that resolves when cart is cleared
   */
  async clearCart(cartId: string): Promise<void> {
    const id = CartId.create(cartId);
    const cart = await this.cartRepository.findById(id);

    if (!cart) {
      throw new Error(`Cart not found: ${cartId}`);
    }

    cart.clear();
    await this.cartRepository.save(cart);
  }
}

