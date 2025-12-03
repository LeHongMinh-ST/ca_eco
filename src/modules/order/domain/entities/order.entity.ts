import { BaseEntity } from "src/shared/domain/entities/base.entity";
import { OrderId } from "../value-objects/order-id.vo";
import { OrderStatus, OrderStatusEnum } from "../value-objects/order-status.vo";
import { OrderItem } from "../value-objects/order-item.vo";
import { UserId } from "src/modules/cart/domain/value-objects/user-id.vo";
import { OrderCreated } from "../events/order-created.event";
import { OrderConfirmed } from "../events/order-confirmed.event";
import { OrderFailed } from "../events/order-failed.event";
import { OrderCancelled } from "../events/order-cancelled.event";
import { OrderStatusChanged } from "../events/order-status-changed.event";
import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";

/**
 * Order aggregate root entity
 * Encapsulates order business logic and invariants
 */
export class Order extends BaseEntity<OrderId> {
  private readonly userId: UserId;
  private readonly items: OrderItem[];
  private status: OrderStatus;
  private readonly totalPrice: number;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private readonly sourceCartId?: string; // Original cart ID that created this order

  private constructor(
    id: OrderId,
    userId: UserId,
    items: OrderItem[],
    status: OrderStatus,
    totalPrice: number,
    createdAt: Date,
    updatedAt: Date,
    sourceCartId?: string,
  ) {
    super(id);
    this.userId = userId;
    this.items = items;
    this.status = status;
    this.totalPrice = totalPrice;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.sourceCartId = sourceCartId;
  }

  /**
   * Factory method to create a new Order instance
   * Raises OrderCreated domain event
   * @param id - Order identifier
   * @param userId - User who created the order
   * @param items - Order items
   * @param sourceCartId - Optional cart ID that created this order (used for clearing cart after confirmation)
   */
  static create(
    id: OrderId,
    userId: UserId,
    items: OrderItem[],
    sourceCartId?: string,
  ): Order {
    if (!items || items.length === 0) {
      throw new InvalidInputError(
        "Order must have at least one item",
        "items",
        items,
      );
    }

    const totalPrice = items.reduce(
      (sum, item) => sum + item.getTotalPrice(),
      0,
    );

    const now = new Date();
    const order = new Order(
      id,
      userId,
      items,
      OrderStatus.create(OrderStatusEnum.PENDING),
      totalPrice,
      now,
      now,
      sourceCartId,
    );

    order.recordEvent(
      new OrderCreated(order.getId(), userId.getValue(), items, totalPrice, sourceCartId),
    );

    return order;
  }

  /**
   * Reconstitutes Order from persistence layer
   * Does not raise domain events (used when loading from database)
   */
  static reconstitute(
    id: OrderId,
    userId: UserId,
    items: OrderItem[],
    status: OrderStatus,
    totalPrice: number,
    createdAt: Date,
    updatedAt: Date,
    sourceCartId?: string,
  ): Order {
    return new Order(id, userId, items, status, totalPrice, createdAt, updatedAt, sourceCartId);
  }

  /**
   * Confirms the order
   * Changes status to CONFIRMED and raises OrderConfirmed event
   * Should be called after inventory is successfully decreased
   */
  confirm(): void {
    if (!this.status.isPending()) {
      throw new InvalidInputError(
        `Cannot confirm order with status: ${this.status.getValue()}`,
        "status",
        this.status.getValue(),
      );
    }

    const oldStatus = this.status;
    this.status = OrderStatus.create(OrderStatusEnum.CONFIRMED);
    this.updatedAt = new Date();

    this.recordEvent(new OrderConfirmed(this.getId()));
    this.recordEvent(
      new OrderStatusChanged(this.getId(), oldStatus.getValue(), OrderStatusEnum.CONFIRMED),
    );
  }

  /**
   * Marks the order as failed
   * Changes status to FAILED and raises OrderFailed event
   * Should be called when inventory check fails or insufficient stock
   */
  markAsFailed(reason: string): void {
    if (!this.status.isPending()) {
      throw new InvalidInputError(
        `Cannot mark order as failed with status: ${this.status.getValue()}`,
        "status",
        this.status.getValue(),
      );
    }

    const oldStatus = this.status;
    this.status = OrderStatus.create(OrderStatusEnum.FAILED);
    this.updatedAt = new Date();

    this.recordEvent(new OrderFailed(this.getId(), reason));
    this.recordEvent(
      new OrderStatusChanged(this.getId(), oldStatus.getValue(), OrderStatusEnum.FAILED),
    );
  }

  /**
   * Cancels the order
   * Changes status to CANCELLED and raises OrderCancelled event
   */
  cancel(): void {
    if (!this.status.canBeCancelled()) {
      throw new InvalidInputError(
        `Cannot cancel order with status: ${this.status.getValue()}`,
        "status",
        this.status.getValue(),
      );
    }

    const oldStatus = this.status;
    this.status = OrderStatus.create(OrderStatusEnum.CANCELLED);
    this.updatedAt = new Date();

    this.recordEvent(new OrderCancelled(this.getId()));
    this.recordEvent(
      new OrderStatusChanged(this.getId(), oldStatus.getValue(), OrderStatusEnum.CANCELLED),
    );
  }

  /**
   * Updates order status
   * Raises OrderStatusChanged event
   */
  updateStatus(newStatus: OrderStatus): void {
    if (this.status.equals(newStatus)) {
      return; // No change, skip event
    }

    // Validate status transition
    const currentStatus = this.status.getValue();
    const nextStatus = newStatus.getValue();

    // Define valid transitions
    const validTransitions: Record<OrderStatusEnum, OrderStatusEnum[]> = {
      [OrderStatusEnum.PENDING]: [
        OrderStatusEnum.CONFIRMED,
        OrderStatusEnum.FAILED,
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.CONFIRMED]: [
        OrderStatusEnum.PAID,
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.PAID]: [OrderStatusEnum.SHIPPED, OrderStatusEnum.CANCELLED],
      [OrderStatusEnum.SHIPPED]: [OrderStatusEnum.DELIVERED, OrderStatusEnum.CANCELLED],
      [OrderStatusEnum.DELIVERED]: [],
      [OrderStatusEnum.CANCELLED]: [],
      [OrderStatusEnum.FAILED]: [],
    };

    const allowedStatuses = validTransitions[currentStatus];
    if (!allowedStatuses.includes(nextStatus)) {
      throw new InvalidInputError(
        `Invalid status transition from ${currentStatus} to ${nextStatus}`,
        "status",
        nextStatus,
      );
    }

    const oldStatus = this.status;
    this.status = newStatus;
    this.updatedAt = new Date();

    this.recordEvent(
      new OrderStatusChanged(this.getId(), oldStatus.getValue(), nextStatus),
    );
  }

  /**
   * Gets user ID value object
   */
  getUserId(): UserId {
    return this.userId;
  }

  /**
   * Gets order items
   */
  getItems(): OrderItem[] {
    return [...this.items]; // Return copy to maintain immutability
  }

  /**
   * Gets order status
   */
  getStatus(): OrderStatus {
    return this.status;
  }

  /**
   * Gets total price
   */
  getTotalPrice(): number {
    return this.totalPrice;
  }

  /**
   * Gets creation date
   */
  getCreatedAt(): Date {
    return this.createdAt;
  }

  /**
   * Gets last update date
   */
  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  /**
   * Gets source cart ID (if order was created from a cart)
   */
  getSourceCartId(): string | undefined {
    return this.sourceCartId;
  }

  /**
   * Compares two Order entities for equality based on ID
   */
  equals(other: Order): boolean {
    if (!other) {
      return false;
    }
    return this.getId().equals(other.getId());
  }
}

