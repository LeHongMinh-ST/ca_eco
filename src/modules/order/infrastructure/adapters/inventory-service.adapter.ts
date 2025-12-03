import { Injectable, Inject, Optional } from "@nestjs/common";
import {
  IInventoryServicePort,
  InventoryInfo,
} from "../../domain/services/inventory-service.port";
import type { IInventoryRepository } from "src/modules/inventory/domain/repositories/inventory.repository.interface";
import { InventoryRepositoryToken } from "src/modules/inventory/domain/repositories/inventory.repository.interface";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";

/**
 * InventoryServiceAdapter implements IInventoryServicePort
 * This is an adapter in Hexagonal Architecture pattern
 * Adapts InventoryRepository from Inventory module to Order module's port interface
 */
@Injectable()
export class InventoryServiceAdapter implements IInventoryServicePort {
  constructor(
    @Optional()
    @Inject(InventoryRepositoryToken)
    private readonly inventoryRepository?: IInventoryRepository,
  ) {}

  /**
   * Gets inventory information for a product
   * @param productId - Product identifier
   * @returns Promise that resolves to inventory info or undefined if not found
   */
  async getInventoryByProductId(
    productId: string,
  ): Promise<InventoryInfo | undefined> {
    if (!this.inventoryRepository) {
      // Fallback: return undefined if repository is not available
      return undefined;
    }

    try {
      const id = ProductId.create(productId);
      const inventory = await this.inventoryRepository.findByProductId(id);

      if (!inventory) {
        return undefined;
      }

      return {
        productId: inventory.getProductId().getValue(),
        quantity: inventory.getQuantity().getValue(),
        available: inventory.isAvailable(),
      };
    } catch (error) {
      if (error instanceof InvalidInputError) {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * Decreases inventory quantity for a product
   * @param productId - Product identifier
   * @param quantity - Quantity to decrease
   * @returns Promise that resolves when decrease is complete
   * @throws Error if insufficient stock
   */
  async decreaseInventory(productId: string, quantity: number): Promise<void> {
    if (!this.inventoryRepository) {
      throw new Error("Inventory repository is not available");
    }

    const id = ProductId.create(productId);
    const inventory = await this.inventoryRepository.findByProductId(id);

    if (!inventory) {
      throw new Error(`Inventory not found for product: ${productId}`);
    }

    // Decrease inventory (will throw error if insufficient stock)
    inventory.decrease(quantity);

    // Save inventory
    await this.inventoryRepository.save(inventory);
  }

  /**
   * Increases inventory quantity for a product (rollback)
   * @param productId - Product identifier
   * @param quantity - Quantity to increase
   * @returns Promise that resolves when increase is complete
   */
  async increaseInventory(productId: string, quantity: number): Promise<void> {
    if (!this.inventoryRepository) {
      throw new Error("Inventory repository is not available");
    }

    const id = ProductId.create(productId);
    const inventory = await this.inventoryRepository.findByProductId(id);

    if (!inventory) {
      throw new Error(`Inventory not found for product: ${productId}`);
    }

    // Increase inventory
    inventory.increase(quantity);

    // Save inventory
    await this.inventoryRepository.save(inventory);
  }
}

