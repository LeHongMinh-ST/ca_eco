import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";

/**
 * OrderStatus enum represents possible order states
 */
export enum OrderStatusEnum {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PAID = "PAID",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
}

/**
 * OrderStatus value object encapsulates order status validation
 */
export class OrderStatus {
  private readonly value: OrderStatusEnum;

  private constructor(value: OrderStatusEnum) {
    this.value = value;
  }

  /**
   * Factory method to create OrderStatus instance
   * @param value - Order status string
   * @returns OrderStatus instance
   * @throws InvalidInputError if status is invalid
   */
  static create(value: string): OrderStatus {
    const status = value.toUpperCase() as OrderStatusEnum;
    if (!Object.values(OrderStatusEnum).includes(status)) {
      throw new InvalidInputError(
        `Invalid order status: ${value}. Valid statuses: ${Object.values(OrderStatusEnum).join(", ")}`,
        "status",
        value,
      );
    }
    return new OrderStatus(status);
  }

  /**
   * Gets the status value
   */
  getValue(): OrderStatusEnum {
    return this.value;
  }

  /**
   * Checks if status is PENDING
   */
  isPending(): boolean {
    return this.value === OrderStatusEnum.PENDING;
  }

  /**
   * Checks if status is CONFIRMED
   */
  isConfirmed(): boolean {
    return this.value === OrderStatusEnum.CONFIRMED;
  }

  /**
   * Checks if status is CANCELLED
   */
  isCancelled(): boolean {
    return this.value === OrderStatusEnum.CANCELLED;
  }

  /**
   * Checks if status is FAILED
   */
  isFailed(): boolean {
    return this.value === OrderStatusEnum.FAILED;
  }

  /**
   * Checks if status is DELIVERED
   */
  isDelivered(): boolean {
    return this.value === OrderStatusEnum.DELIVERED;
  }

  /**
   * Checks if order can be cancelled
   */
  canBeCancelled(): boolean {
    return (
      this.value !== OrderStatusEnum.DELIVERED &&
      this.value !== OrderStatusEnum.CANCELLED &&
      this.value !== OrderStatusEnum.FAILED
    );
  }

  /**
   * Compares two OrderStatus instances for equality
   */
  equals(other: OrderStatus): boolean {
    if (!other) {
      return false;
    }
    return this.value === other.value;
  }
}

