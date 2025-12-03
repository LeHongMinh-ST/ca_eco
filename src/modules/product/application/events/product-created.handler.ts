import { Injectable } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { IEventHandler } from "src/shared/application/events/event-handler.interface";
import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import { ProductCreated } from "../../domain/events/product-created.event";

/**
 * ProductCreatedHandler handles ProductCreated domain events
 * Example event handler to demonstrate outbox pattern usage
 */
@Injectable()
export class ProductCreatedHandler implements IEventHandler {
  private readonly logger = new Logger(ProductCreatedHandler.name);

  /**
   * Handles ProductCreated domain event
   * @param event - Domain event (will be ProductCreated when dispatched)
   */
  async handle(event: DomainEvent): Promise<void> {
    // Type guard to ensure event is ProductCreated
    if (event.name !== "ProductCreated") {
      return;
    }

    // Cast to ProductCreated for type safety
    const productCreatedEvent = event as unknown as ProductCreated;

    this.logger.log(
      `Product created event received: ${productCreatedEvent.productId.getValue()}`,
    );

    // Example: Send notification, update search index, etc.
    // In a real application, you would implement actual business logic here
    // For example:
    // - Send email notification
    // - Update search index
    // - Update cache
    // - Trigger webhook
  }
}

