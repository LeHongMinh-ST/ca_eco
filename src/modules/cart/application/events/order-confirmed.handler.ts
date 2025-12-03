import { Injectable, Logger, Inject } from "@nestjs/common";
import { IEventHandler } from "src/shared/application/events/event-handler.interface";
import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import type { ICartRepository } from "../../domain/repositories/cart.repository.interface";
import { CartRepositoryToken } from "../../domain/repositories/cart.repository.interface";
import { CartId } from "../../domain/value-objects/cart-id.vo";

/**
 * CartClearOnOrderConfirmedHandler handles OrderConfirmed domain events
 * Note: Cart is already cleared immediately after order creation in CreateOrderHandler
 * This handler serves as a safety net to clear cart if it wasn't cleared before
 */
@Injectable()
export class CartClearOnOrderConfirmedHandler implements IEventHandler {
  private readonly logger = new Logger(CartClearOnOrderConfirmedHandler.name);

  constructor(
    @Inject(CartRepositoryToken)
    private readonly cartRepository: ICartRepository,
  ) {}

  /**
   * Handles OrderConfirmed domain event
   * Clears the cart that was used to create the order
   * @param event - Domain event (will be OrderConfirmed when dispatched)
   */
  async handle(event: DomainEvent): Promise<void> {
    // Type guard to ensure event is OrderConfirmed
    if (event.name !== "OrderConfirmed") {
      return;
    }

    try {
      // Extract sourceCartId from event payload
      const eventPayload = event as unknown as Record<string, unknown>;
      let sourceCartId: string | undefined;

      // Handle different event payload structures
      const cartIdFromPayload = eventPayload.sourceCartId;
      if (cartIdFromPayload) {
        if (typeof cartIdFromPayload === "string") {
          sourceCartId = cartIdFromPayload;
        }
      }

      // If no sourceCartId, the order was not created from a cart
      if (!sourceCartId) {
        this.logger.log(
          "OrderConfirmed event has no sourceCartId, skipping cart clear",
        );
        return;
      }

      this.logger.log(
        `OrderConfirmed event received, clearing cart: ${sourceCartId}`,
      );

      // Get cart by ID
      const cartId = CartId.create(sourceCartId);
      const cart = await this.cartRepository.findById(cartId);

      if (!cart) {
        this.logger.log(`Cart ${sourceCartId} not found, may have been already cleared`);
        return;
      }

      // Check if cart is already empty (already cleared by CreateOrderHandler)
      if (cart.isEmpty()) {
        this.logger.log(`Cart ${sourceCartId} is already empty, skipping clear`);
        return;
      }

      // Clear cart items (safety net)
      cart.clear();

      // Save cart
      await this.cartRepository.save(cart);

      this.logger.log(
        `Cart cleared successfully after order confirmation: ${sourceCartId}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error clearing cart from OrderConfirmed event: ${errorMessage}`,
        errorStack,
      );
      // Don't throw error to prevent event processing failure
      // The cart can be cleared manually later if needed
    }
  }
}

