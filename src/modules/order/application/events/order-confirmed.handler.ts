import { Injectable, Logger, Inject } from "@nestjs/common";
import { IEventHandler } from "src/shared/application/events/event-handler.interface";
import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import type { IOrderRepository } from "../../domain/repositories/order.repository.interface";
import { OrderRepositoryToken } from "../../domain/repositories/order.repository.interface";
import { OrderId } from "../../domain/value-objects/order-id.vo";

/**
 * OrderConfirmedHandler handles OrderConfirmed domain events
 * Updates order status to CONFIRMED when inventory is successfully decreased
 */
@Injectable()
export class OrderConfirmedHandler implements IEventHandler {
  private readonly logger = new Logger(OrderConfirmedHandler.name);

  constructor(
    @Inject(OrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
  ) {}

  /**
   * Handles OrderConfirmed domain event
   * Updates order status to CONFIRMED
   * @param event - Domain event (will be OrderConfirmed when dispatched)
   */
  async handle(event: DomainEvent): Promise<void> {
    // Type guard to ensure event is OrderConfirmed
    if (event.name !== "OrderConfirmed") {
      return;
    }

    try {
      // Extract orderId from event payload
      const eventPayload = event as unknown as Record<string, unknown>;
      let orderIdValue: string | undefined;

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

      if (!orderIdValue) {
        this.logger.warn(
          `Unable to extract orderId from OrderConfirmed event: ${JSON.stringify(eventPayload)}`,
        );
        return;
      }

      this.logger.log(
        `OrderConfirmed event received, confirming order: ${orderIdValue}`,
      );

      // Get order
      const orderId = OrderId.create(orderIdValue);
      const order = await this.orderRepository.findById(orderId);

      if (!order) {
        this.logger.warn(`Order not found: ${orderIdValue}`);
        return;
      }

      // Confirm order (update status to CONFIRMED)
      order.confirm();

      // Save order
      await this.orderRepository.save(order);

      this.logger.log(`Order confirmed successfully: ${orderIdValue}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error confirming order from OrderConfirmed event: ${errorMessage}`,
        errorStack,
      );
      // Don't throw error to prevent event processing failure
    }
  }
}

