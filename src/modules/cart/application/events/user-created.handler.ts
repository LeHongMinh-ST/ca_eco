import { Injectable, Logger, Inject } from "@nestjs/common";
import { IEventHandler } from "src/shared/application/events/event-handler.interface";
import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import type { ICartRepository } from "../../domain/repositories/cart.repository.interface";
import { CartRepositoryToken } from "../../domain/repositories/cart.repository.interface";
import { Cart } from "../../domain/entities/cart.entity";
import { CartId } from "../../domain/value-objects/cart-id.vo";
import { UserId } from "../../domain/value-objects/user-id.vo";

/**
 * UserCreatedHandler handles UserCreated domain events
 * Automatically creates a cart for newly created users
 */
@Injectable()
export class UserCreatedHandler implements IEventHandler {
  private readonly logger = new Logger(UserCreatedHandler.name);

  constructor(
    @Inject(CartRepositoryToken)
    private readonly cartRepository: ICartRepository,
  ) {}

  /**
   * Handles UserCreated domain event
   * Automatically creates a cart for the newly created user
   * @param event - Domain event (will be UserCreated when dispatched)
   */
  async handle(event: DomainEvent): Promise<void> {
    // Type guard to ensure event is UserCreated
    if (event.name !== "UserCreated") {
      return;
    }

    try {
      // Extract userId from event payload
      // After serialization, userId (value object) becomes a string in payload
      const eventPayload = event as unknown as Record<string, unknown>;
      let userIdValue: string | undefined;

      // Handle different event payload structures
      const userIdFromPayload = eventPayload.userId;
      if (userIdFromPayload) {
        // If userId is already a string (after serialization)
        if (typeof userIdFromPayload === "string") {
          userIdValue = userIdFromPayload;
        }
        // If userId is a value object with getValue() method (direct event object)
        else if (
          typeof userIdFromPayload === "object" &&
          userIdFromPayload !== null &&
          "getValue" in userIdFromPayload &&
          typeof (userIdFromPayload as { getValue: () => string }).getValue ===
            "function"
        ) {
          userIdValue = (
            userIdFromPayload as { getValue: () => string }
          ).getValue();
        }
        // If userId is an object with value property
        else if (
          typeof userIdFromPayload === "object" &&
          userIdFromPayload !== null &&
          "value" in userIdFromPayload &&
          typeof (userIdFromPayload as { value: string }).value === "string"
        ) {
          userIdValue = (userIdFromPayload as { value: string }).value;
        }
      }

      if (!userIdValue) {
        this.logger.warn(
          `Unable to extract userId from UserCreated event: ${JSON.stringify(eventPayload)}`,
        );
        return;
      }

      this.logger.log(
        `UserCreated event received, creating cart for user: ${userIdValue}`,
      );

      // Convert to cart domain UserId
      const cartUserId = UserId.create(userIdValue);

      // Check if cart already exists for this user
      const existingCart = await this.cartRepository.findByUserId(cartUserId);
      if (existingCart) {
        this.logger.log(
          `Cart already exists for user ${userIdValue}, skipping creation`,
        );
        return;
      }

      // Generate new cart ID
      const cartId = CartId.create(crypto.randomUUID());

      // Create cart entity
      const cart = Cart.create(cartId, cartUserId);

      // Save cart
      await this.cartRepository.save(cart);

      this.logger.log(
        `Cart created successfully for user ${userIdValue}: ${cartId.getValue()}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error creating cart for user from UserCreated event: ${errorMessage}`,
        errorStack,
      );
      // Don't throw error to prevent event processing failure
      // The cart can be created manually later if needed
    }
  }
}
