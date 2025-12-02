import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import { InventoryId } from "../value-objects/inventory-id.vo";
import { Quantity } from "../value-objects/quantity.vo";

/**
 * InventoryIncreased domain event is raised when inventory quantity is increased
 */
export class InventoryIncreased implements DomainEvent {
  readonly name = "InventoryIncreased";
  readonly occurredAt: Date;
  readonly inventoryId: InventoryId;
  readonly oldQuantity: Quantity;
  readonly newQuantity: Quantity;
  readonly amount: number;

  constructor(
    inventoryId: InventoryId,
    oldQuantity: Quantity,
    newQuantity: Quantity,
    amount: number,
  ) {
    this.inventoryId = inventoryId;
    this.oldQuantity = oldQuantity;
    this.newQuantity = newQuantity;
    this.amount = amount;
    this.occurredAt = new Date();
  }
}
