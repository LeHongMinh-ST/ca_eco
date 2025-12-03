import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";
import { BaseEntity } from "src/shared/domain/entities/base.entity";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
import { InventoryCreated } from "../events/inventory-created.event";
import { InventoryDecreased } from "../events/inventory-decreased.event";
import { InventoryIncreased } from "../events/inventory-increased.event";
import { InventoryLowStock } from "../events/inventory-low-stock.event";
import { InventoryOutOfStock } from "../events/inventory-out-of-stock.event";
import { InventoryId } from "../value-objects/inventory-id.vo";
import { Quantity } from "../value-objects/quantity.vo";

/**
 * Inventory aggregate root entity
 * Manages product stock quantity and inventory operations
 */
export class Inventory extends BaseEntity<InventoryId> {
  private readonly productId: ProductId;
  private quantity: Quantity;
  private lowStockThreshold: number;

  private constructor(
    id: InventoryId,
    productId: ProductId,
    quantity: Quantity,
    lowStockThreshold: number = 10,
  ) {
    super(id);
    this.productId = productId;
    this.quantity = quantity;
    this.lowStockThreshold = lowStockThreshold;
  }

  /**
   * Factory method to create a new Inventory instance
   * Raises InventoryCreated domain event
   */
  static create(
    id: InventoryId,
    productId: ProductId,
    initialQuantity: Quantity,
    lowStockThreshold?: number,
  ): Inventory {
    const inventory = new Inventory(
      id,
      productId,
      initialQuantity,
      lowStockThreshold,
    );
    inventory.recordEvent(new InventoryCreated(id, productId));
    return inventory;
  }

  /**
   * Increases inventory quantity by specified amount
   * Raises InventoryIncreased domain event
   */
  increase(amount: number): void {
    if (amount <= 0) {
      throw new InvalidInputError(
        "Increase amount must be greater than zero",
        "amount",
        amount,
      );
    }

    if (!Number.isInteger(amount)) {
      throw new InvalidInputError(
        "Increase amount must be an integer",
        "amount",
        amount,
      );
    }

    const oldQuantity = this.quantity;
    const newQuantity = Quantity.create(this.quantity.getValue() + amount);
    this.quantity = newQuantity;

    this.recordEvent(
      new InventoryIncreased(this.getId(), oldQuantity, newQuantity, amount),
    );
  }

  /**
   * Decreases inventory quantity by specified amount
   * Validates sufficient stock availability
   * Raises InventoryDecreased domain event
   * May raise InventoryOutOfStock or InventoryLowStock events
   */
  decrease(amount: number): void {
    if (amount <= 0) {
      throw new InvalidInputError(
        "Decrease amount must be greater than zero",
        "amount",
        amount,
      );
    }

    if (!Number.isInteger(amount)) {
      throw new InvalidInputError(
        "Decrease amount must be an integer",
        "amount",
        amount,
      );
    }

    const currentQty = this.quantity.getValue();
    if (currentQty < amount) {
      throw new InvalidInputError(
        `Insufficient stock. Available: ${currentQty}, Requested: ${amount}`,
        "amount",
        amount,
      );
    }

    const oldQuantity = this.quantity;
    const newQuantity = Quantity.create(currentQty - amount);
    this.quantity = newQuantity;

    this.recordEvent(
      new InventoryDecreased(this.getId(), oldQuantity, newQuantity, amount),
    );

    // Check if inventory becomes out of stock
    if (newQuantity.getValue() === 0) {
      this.recordEvent(new InventoryOutOfStock(this.getId(), this.productId));
    }
    // Check if inventory falls below threshold
    else if (
      newQuantity.getValue() < this.lowStockThreshold &&
      oldQuantity.getValue() >= this.lowStockThreshold
    ) {
      this.recordEvent(
        new InventoryLowStock(
          this.getId(),
          this.productId,
          newQuantity,
          this.lowStockThreshold,
        ),
      );
    }
  }

  /**
   * Updates inventory quantity to a specific value
   * Raises appropriate domain events based on change direction
   */
  updateQuantity(newQuantity: Quantity): void {
    const oldQuantity = this.quantity;
    const oldValue = oldQuantity.getValue();
    const newValue = newQuantity.getValue();

    if (oldValue === newValue) {
      return; // No change, skip events
    }

    this.quantity = newQuantity;

    if (newValue > oldValue) {
      const amount = newValue - oldValue;
      this.recordEvent(
        new InventoryIncreased(this.getId(), oldQuantity, newQuantity, amount),
      );
    } else {
      const amount = oldValue - newValue;
      this.recordEvent(
        new InventoryDecreased(this.getId(), oldQuantity, newQuantity, amount),
      );

      // Check for out of stock
      if (newValue === 0) {
        this.recordEvent(new InventoryOutOfStock(this.getId(), this.productId));
      }
      // Check for low stock
      else if (
        newValue < this.lowStockThreshold &&
        oldValue >= this.lowStockThreshold
      ) {
        this.recordEvent(
          new InventoryLowStock(
            this.getId(),
            this.productId,
            newQuantity,
            this.lowStockThreshold,
          ),
        );
      }
    }
  }

  /**
   * Updates low stock threshold
   */
  updateLowStockThreshold(threshold: number): void {
    if (threshold < 0 || !Number.isInteger(threshold)) {
      throw new InvalidInputError(
        "Low stock threshold must be a non-negative integer",
        "threshold",
        threshold,
      );
    }
    this.lowStockThreshold = threshold;
  }

  /**
   * Checks if inventory is available (has stock)
   */
  isAvailable(): boolean {
    return this.quantity.getValue() > 0;
  }

  /**
   * Checks if inventory has sufficient stock for requested quantity
   */
  hasStock(requiredQty: number): boolean {
    if (requiredQty <= 0 || !Number.isInteger(requiredQty)) {
      return false;
    }
    return this.quantity.getValue() >= requiredQty;
  }

  /**
   * Checks if inventory is below low stock threshold
   */
  isLowStock(): boolean {
    return (
      this.quantity.getValue() > 0 &&
      this.quantity.getValue() < this.lowStockThreshold
    );
  }

  /**
   * Gets associated product ID
   */
  getProductId(): ProductId {
    return this.productId;
  }

  /**
   * Gets current quantity value object
   */
  getQuantity(): Quantity {
    return this.quantity;
  }

  /**
   * Gets low stock threshold
   */
  getLowStockThreshold(): number {
    return this.lowStockThreshold;
  }

  /**
   * Compares two Inventory entities for equality based on ID
   */
  equals(other: Inventory): boolean {
    if (!other) {
      return false;
    }
    return this.getId().equals(other.getId());
  }
}
