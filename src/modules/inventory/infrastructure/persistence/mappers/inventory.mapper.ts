import { Inventory } from "src/modules/inventory/domain/entities/inventory.entity";
import { InventoryId } from "src/modules/inventory/domain/value-objects/inventory-id.vo";
import { Quantity } from "src/modules/inventory/domain/value-objects/quantity.vo";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
import { InventoryOrmEntity } from "../entities/inventory.orm-entity";

/**
 * InventoryMapper converts between domain entities and TypeORM entities
 */
export class InventoryMapper {
  /**
   * Converts domain Inventory entity to TypeORM entity
   * @param inventory - Domain Inventory entity
   * @returns InventoryOrmEntity for TypeORM persistence
   */
  static toPersistence(inventory: Inventory): Partial<InventoryOrmEntity> {
    return {
      id: inventory.getId().getValue(),
      productId: inventory.getProductId().getValue(),
      quantity: inventory.getQuantity().getValue(),
      lowStockThreshold: inventory.getLowStockThreshold(),
    };
  }

  /**
   * Converts TypeORM entity to domain Inventory entity
   * @param ormEntity - InventoryOrmEntity from TypeORM
   * @returns Domain Inventory entity
   */
  static toDomain(ormEntity: InventoryOrmEntity): Inventory {
    const inventoryId = InventoryId.create(ormEntity.id);
    const productId = ProductId.create(ormEntity.productId);
    const quantity = Quantity.create(ormEntity.quantity);

    // Use reconstitute to avoid raising domain events when loading from database
    return Inventory.reconstitute(
      inventoryId,
      productId,
      quantity,
      ormEntity.lowStockThreshold,
    );
  }
}

