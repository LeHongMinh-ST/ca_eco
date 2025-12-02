import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import { InventoryId } from "../value-objects/inventory-id.vo";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";

/**
 * InventoryCreated domain event is raised when a new inventory record is created
 */
export class InventoryCreated implements DomainEvent {
  readonly name = "InventoryCreated";
  readonly occurredAt: Date;
  readonly inventoryId: InventoryId;
  readonly productId: ProductId;

  constructor(inventoryId: InventoryId, productId: ProductId) {
    this.inventoryId = inventoryId;
    this.productId = productId;
    this.occurredAt = new Date();
  }
}
