/**
 * IInventoryServicePort defines the interface for inventory operations
 * This is a port in the Ports and Adapters pattern
 * Implementation should be in infrastructure layer
 */
export interface IInventoryServicePort {
  /**
   * Gets inventory information for a product
   * @param productId - Product identifier
   * @returns Promise that resolves to inventory info or undefined if not found
   */
  getInventoryByProductId(
    productId: string,
  ): Promise<InventoryInfo | undefined>;

  /**
   * Decreases inventory quantity for a product
   * @param productId - Product identifier
   * @param quantity - Quantity to decrease
   * @returns Promise that resolves when decrease is complete
   * @throws Error if insufficient stock
   */
  decreaseInventory(productId: string, quantity: number): Promise<void>;

  /**
   * Increases inventory quantity for a product (rollback)
   * @param productId - Product identifier
   * @param quantity - Quantity to increase
   * @returns Promise that resolves when increase is complete
   */
  increaseInventory(productId: string, quantity: number): Promise<void>;
}

/**
 * Inventory information DTO
 */
export interface InventoryInfo {
  readonly productId: string;
  readonly quantity: number;
  readonly available: boolean;
}

/**
 * Token for dependency injection
 */
export const InventoryServicePortToken = "IInventoryServicePort";

