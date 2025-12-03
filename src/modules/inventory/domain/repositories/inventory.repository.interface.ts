import { Inventory } from "../entities/inventory.entity";
import { InventoryId } from "../value-objects/inventory-id.vo";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";

/**
 * IInventoryRepository defines the contract for inventory persistence
 * Implementations should handle saving and retrieving Inventory aggregate roots
 */
export interface IInventoryRepository {
  /**
   * Saves an inventory entity
   * Creates new inventory if not exists, updates if exists
   * @param inventory - Inventory entity to save
   * @returns Promise that resolves when save is complete
   */
  save(inventory: Inventory): Promise<void>;

  /**
   * Finds inventory by its ID
   * @param id - Inventory identifier
   * @returns Promise that resolves to Inventory entity or undefined if not found
   */
  findById(id: InventoryId): Promise<Inventory | undefined>;

  /**
   * Finds inventory by product ID
   * @param productId - Product identifier
   * @returns Promise that resolves to Inventory entity or undefined if not found
   */
  findByProductId(productId: ProductId): Promise<Inventory | undefined>;

  /**
   * Checks if inventory exists by ID
   * @param id - Inventory identifier
   * @returns Promise that resolves to true if inventory exists, false otherwise
   */
  exists(id: InventoryId): Promise<boolean>;
}

/**
 * Token for dependency injection
 */
export const InventoryRepositoryToken = "IInventoryRepository";

