import { Inventory } from "src/modules/inventory/domain/entities/inventory.entity";
import { InventoryId } from "src/modules/inventory/domain/value-objects/inventory-id.vo";
import { Quantity } from "src/modules/inventory/domain/value-objects/quantity.vo";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
import {
  InventoryMongoEntity,
  InventoryDocument,
} from "../entities/inventory.schema";

/**
 * InventoryMongoMapper converts between domain entities and MongoDB documents
 */
export class InventoryMongoMapper {
  /**
   * Converts domain Inventory entity to MongoDB document
   * @param inventory - Domain Inventory entity
   * @returns InventoryMongoEntity for MongoDB persistence
   */
  static toPersistence(inventory: Inventory): Partial<InventoryMongoEntity> {
    return {
      _id: inventory.getId().getValue(),
      productId: inventory.getProductId().getValue(),
      quantity: inventory.getQuantity().getValue(),
      lowStockThreshold: inventory.getLowStockThreshold(),
    };
  }

  /**
   * Converts MongoDB document to domain Inventory entity
   * @param document - InventoryDocument from MongoDB
   * @returns Domain Inventory entity
   */
  static toDomain(document: InventoryDocument | InventoryMongoEntity): Inventory {
    const inventoryId = InventoryId.create(document._id);
    const productId = ProductId.create(document.productId);
    const quantity = Quantity.create(document.quantity);

    // Use reconstitute to avoid raising domain events when loading from database
    return Inventory.reconstitute(
      inventoryId,
      productId,
      quantity,
      document.lowStockThreshold,
    );
  }
}

