import { Injectable, Logger, Inject } from "@nestjs/common";
import { IEventHandler } from "src/shared/application/events/event-handler.interface";
import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import type { IOrderRepository } from "../../domain/repositories/order.repository.interface";
import { OrderRepositoryToken } from "../../domain/repositories/order.repository.interface";
import { OrderId } from "../../domain/value-objects/order-id.vo";

/**
 * OrderFailedHandler handles OrderFailed domain events
 * Updates order status to FAILED when inventory check fails
 */
@Injectable()
export class OrderFailedHandler implements IEventHandler {
  private readonly logger = new Logger(OrderFailedHandler.name);

  constructor(
    @Inject(OrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
  ) {}

  /**
   * Handles OrderFailed domain event
   * Updates order status to FAILED
   * @param event - Domain event (will be OrderFailed when dispatched)
   */
  async handle(event: DomainEvent): Promise<void> {
    // Type guard to ensure event is OrderFailed
    if (event.name !== "OrderFailed") {
      return;
    }

    try {
      // Extract orderId and reason from event payload
      const eventPayload = event as unknown as Record<string, unknown>;
      let orderIdValue: string | undefined;
      let reason: string | undefined;

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

      if (eventPayload.reason && typeof eventPayload.reason === "string") {
        reason = eventPayload.reason;
      }

      if (!orderIdValue) {
        this.logger.warn(
          `Unable to extract orderId from OrderFailed event: ${JSON.stringify(eventPayload)}`,
        );
        return;
      }

      this.logger.log(
        `OrderFailed event received, marking order as failed: ${orderIdValue}, reason: ${reason || "Unknown"}`,
      );

      // Get order
      const orderId = OrderId.create(orderIdValue);
      const order = await this.orderRepository.findById(orderId);

      if (!order) {
        this.logger.warn(`Order not found: ${orderIdValue}`);
        return;
      }

      // Mark order as failed
      order.markAsFailed(reason || "Inventory check failed");

      // Save order
      await this.orderRepository.save(order);

      this.logger.log(`Order marked as failed: ${orderIdValue}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error marking order as failed from OrderFailed event: ${errorMessage}`,
        errorStack,
      );
      // Don't throw error to prevent event processing failure
    }
  }
}

