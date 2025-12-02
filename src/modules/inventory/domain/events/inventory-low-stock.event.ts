import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import { InventoryId } from "../value-objects/inventory-id.vo";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
import { Quantity } from "../value-objects/quantity.vo";

/**
 * InventoryLowStock domain event is raised when inventory quantity falls below threshold
 */
export class InventoryLowStock implements DomainEvent {
  readonly name = "InventoryLowStock";
  readonly occurredAt: Date;
  readonly inventoryId: InventoryId;
  readonly productId: ProductId;
  readonly currentQuantity: Quantity;
  readonly threshold: number;

  constructor(
    inventoryId: InventoryId,
    productId: ProductId,
    currentQuantity: Quantity,
    threshold: number,
  ) {
    this.inventoryId = inventoryId;
    this.productId = productId;
    this.currentQuantity = currentQuantity;
    this.threshold = threshold;
    this.occurredAt = new Date();
  }
}
