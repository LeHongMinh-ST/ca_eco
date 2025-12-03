import { Injectable, Logger, Inject } from "@nestjs/common";
import { IEventHandler } from "src/shared/application/events/event-handler.interface";
import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import type { IInventoryRepository } from "../../domain/repositories/inventory.repository.interface";
import { InventoryRepositoryToken } from "../../domain/repositories/inventory.repository.interface";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
// Import order events and value objects
// Note: These imports create a dependency from inventory to order domain
// This is acceptable for event-driven architecture as events are part of the contract
import { OrderConfirmed } from "src/modules/order/domain/events/order-confirmed.event";
import { OrderFailed } from "src/modules/order/domain/events/order-failed.event";
import { OrderId } from "src/modules/order/domain/value-objects/order-id.vo";
import type { IDomainEventDispatcher } from "src/shared/application/events/domain-event-dispatcher.interface";
import { DomainEventDispatcherToken } from "src/shared/application/events/domain-event-dispatcher.interface";

/**
 * OrderCreatedHandler handles OrderCreated domain events
 * Checks inventory availability and decreases inventory for each order item
 * Raises OrderConfirmed event if successful, OrderFailed event if insufficient stock
 */
@Injectable()
export class OrderCreatedHandler implements IEventHandler {
  private readonly logger = new Logger(OrderCreatedHandler.name);

  constructor(
    @Inject(InventoryRepositoryToken)
    private readonly inventoryRepository: IInventoryRepository,
    @Inject(DomainEventDispatcherToken)
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  /**
   * Handles OrderCreated domain event
   * Checks inventory and decreases stock for each order item
   * @param event - Domain event (will be OrderCreated when dispatched)
   */
  async handle(event: DomainEvent): Promise<void> {
    // Type guard to ensure event is OrderCreated
    if (event.name !== "OrderCreated") {
      return;
    }

    try {
      // Extract order information from event payload
      const eventPayload = event as unknown as Record<string, unknown>;
      let orderIdValue: string | undefined;
      let items: Array<{
        productId: string;
        productName: string;
        productPrice: number;
        quantity: number;
      }> = [];

      const orderIdFromPayload = eventPayload.orderId;
      if (orderIdFromPayload) {
        if (typeof orderIdFromPayload === "string") {
          orderIdValue = orderIdFromPayload;
        } else if (
          typeof orderIdFromPayload === "object" &&
          orderIdFromPayload !== null &&
          "getValue" in orderIdFromPayload &&
          typeof (orderIdFromPayload as { getValue: () => string }).getValue ===
            "function"
        ) {
          orderIdValue = (
            orderIdFromPayload as { getValue: () => string }
          ).getValue();
        }
      }

      if (Array.isArray(eventPayload.items)) {
        items = eventPayload.items as Array<{
          productId: string;
          productName: string;
          productPrice: number;
          quantity: number;
        }>;
      }

      if (!orderIdValue) {
        this.logger.warn(
          `Unable to extract orderId from OrderCreated event: ${JSON.stringify(eventPayload)}`,
        );
        return;
      }

      if (!items || items.length === 0) {
        this.logger.warn(
          `OrderCreated event has no items: ${orderIdValue}`,
        );
        await this.eventDispatcher.dispatch(
          new OrderFailed(
            OrderId.create(orderIdValue),
            "Order has no items",
          ),
        );
        return;
      }

      this.logger.log(
        `OrderCreated event received, checking inventory for order: ${orderIdValue}`,
      );

      const orderId = OrderId.create(orderIdValue);

      // Check inventory availability for all items
      const inventoryChecks: Array<{
        productId: string;
        requiredQuantity: number;
        availableQuantity: number;
        inventoryExists: boolean;
      }> = [];

      for (const item of items) {
        const productId = ProductId.create(item.productId);
        const inventory = await this.inventoryRepository.findByProductId(
          productId,
        );

        if (!inventory) {
          inventoryChecks.push({
            productId: item.productId,
            requiredQuantity: item.quantity,
            availableQuantity: 0,
            inventoryExists: false,
          });
          continue;
        }

        const availableQuantity = inventory.getQuantity().getValue();
        inventoryChecks.push({
          productId: item.productId,
          requiredQuantity: item.quantity,
          availableQuantity,
          inventoryExists: true,
        });
      }

      // Check if all items have sufficient inventory
      const insufficientStock = inventoryChecks.find(
        (check) => !check.inventoryExists || check.availableQuantity < check.requiredQuantity,
      );

      if (insufficientStock) {
        const reason = insufficientStock.inventoryExists
          ? `Insufficient stock for product ${insufficientStock.productId}. Required: ${insufficientStock.requiredQuantity}, Available: ${insufficientStock.availableQuantity}`
          : `Inventory not found for product ${insufficientStock.productId}`;

        this.logger.warn(
          `Order ${orderIdValue} failed inventory check: ${reason}`,
        );

        // Raise OrderFailed event
        await this.eventDispatcher.dispatch(
          new OrderFailed(orderId, reason),
        );
        return;
      }

      // All items have sufficient inventory, decrease inventory for each product
      try {
        for (const item of items) {
          const productId = ProductId.create(item.productId);
          const inventory = await this.inventoryRepository.findByProductId(
            productId,
          );

          if (!inventory) {
            throw new Error(`Inventory not found for product: ${item.productId}`);
          }

          // Decrease inventory (will throw error if insufficient stock)
          inventory.decrease(item.quantity);

          // Save inventory
          await this.inventoryRepository.save(inventory);

          this.logger.log(
            `Decreased inventory for product ${item.productId} by ${item.quantity}`,
          );
        }

        // All inventory decreases successful, raise OrderConfirmed event
        this.logger.log(
          `All inventory checks passed for order ${orderIdValue}, confirming order`,
        );

        await this.eventDispatcher.dispatch(new OrderConfirmed(orderId));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Error decreasing inventory for order ${orderIdValue}: ${errorMessage}`,
        );

        // Raise OrderFailed event
        await this.eventDispatcher.dispatch(
          new OrderFailed(orderId, `Inventory decrease failed: ${errorMessage}`),
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error processing OrderCreated event: ${errorMessage}`,
        errorStack,
      );
      // Don't throw error to prevent event processing failure
      // Try to raise OrderFailed event if we have orderId
      try {
        const eventPayload = event as unknown as Record<string, unknown>;
        const orderIdFromPayload = eventPayload.orderId;
        if (orderIdFromPayload) {
          let orderIdValue: string | undefined;
          if (typeof orderIdFromPayload === "string") {
            orderIdValue = orderIdFromPayload;
          } else if (
            typeof orderIdFromPayload === "object" &&
            orderIdFromPayload !== null &&
            "getValue" in orderIdFromPayload
          ) {
            orderIdValue = (
              orderIdFromPayload as { getValue: () => string }
            ).getValue();
          }
          if (orderIdValue) {
            await this.eventDispatcher.dispatch(
              new OrderFailed(
                OrderId.create(orderIdValue),
                `Error processing order: ${errorMessage}`,
              ),
            );
          }
        }
      } catch (dispatchError) {
        this.logger.error(
          `Failed to dispatch OrderFailed event: ${dispatchError}`,
        );
      }
    }
  }
}

