import { Injectable, Logger, Inject } from "@nestjs/common";
import { IEventHandler } from "src/shared/application/events/event-handler.interface";
import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import type { IInventoryRepository } from "../../domain/repositories/inventory.repository.interface";
import { InventoryRepositoryToken } from "../../domain/repositories/inventory.repository.interface";
import { Inventory } from "../../domain/entities/inventory.entity";
import { InventoryId } from "../../domain/value-objects/inventory-id.vo";
import { Quantity } from "../../domain/value-objects/quantity.vo";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";

/**
 * ProductCreatedHandler handles ProductCreated domain events
 * Automatically creates inventory for the newly created product
 */
@Injectable()
export class ProductCreatedHandler implements IEventHandler {
  private readonly logger = new Logger(ProductCreatedHandler.name);

  constructor(
    @Inject(InventoryRepositoryToken)
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  /**
   * Handles ProductCreated domain event
   * Creates inventory with initial quantity of 0 for the new product
   * @param event - Domain event (will be ProductCreated when dispatched)
   */
  async handle(event: DomainEvent): Promise<void> {
    // Type guard to ensure event is ProductCreated
    if (event.name !== "ProductCreated") {
      return;
    }

    try {
      // Extract product information from event payload
      const eventPayload = event as unknown as Record<string, unknown>;
      let productIdValue: string | undefined;

      const productIdFromPayload = eventPayload.productId;
      if (productIdFromPayload) {
        if (typeof productIdFromPayload === "string") {
          productIdValue = productIdFromPayload;
        } else if (
          typeof productIdFromPayload === "object" &&
          productIdFromPayload !== null &&
          "getValue" in productIdFromPayload &&
          typeof (productIdFromPayload as { getValue: () => string }).getValue ===
            "function"
        ) {
          productIdValue = (
            productIdFromPayload as { getValue: () => string }
          ).getValue();
        }
      }

      if (!productIdValue) {
        this.logger.warn(
          `Unable to extract productId from ProductCreated event: ${JSON.stringify(eventPayload)}`,
        );
        return;
      }

      this.logger.log(
        `ProductCreated event received, creating inventory for product: ${productIdValue}`,
      );

      const productId = ProductId.create(productIdValue);

      // Check if inventory already exists for this product
      const existingInventory = await this.inventoryRepository.findByProductId(
        productId,
      );

      if (existingInventory) {
        this.logger.log(
          `Inventory already exists for product ${productIdValue}, skipping creation`,
        );
        return;
      }

      // Create new inventory with initial quantity of 0
      const inventoryId = InventoryId.create(crypto.randomUUID());
      const initialQuantity = Quantity.create(0);
      const inventory = Inventory.create(inventoryId, productId, initialQuantity);

      // Save inventory
      await this.inventoryRepository.save(inventory);

      this.logger.log(
        `Inventory created successfully for product ${productIdValue}: ${inventoryId.getValue()}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error creating inventory for product from ProductCreated event: ${errorMessage}`,
        errorStack,
      );
      // Don't throw error to prevent event processing failure
    }
  }
}

