import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import { InventoryId } from "../value-objects/inventory-id.vo";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";

/**
 * InventoryOutOfStock domain event is raised when inventory quantity reaches zero
 */
export class InventoryOutOfStock implements DomainEvent {
  readonly name = "InventoryOutOfStock";
  readonly occurredAt: Date;
  readonly inventoryId: InventoryId;
  readonly productId: ProductId;

  constructor(inventoryId: InventoryId, productId: ProductId) {
    this.inventoryId = inventoryId;
    this.productId = productId;
    this.occurredAt = new Date();
  }
}
