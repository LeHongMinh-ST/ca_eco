import { Product } from "../entities/product.entity";
import { ProductId } from "../value-objects/product-id.vo";

/**
 * ProductRepository interface defines contract for product persistence
 * Implementation should be provided in infrastructure layer
 */
export interface IProductRepository {
  /**
   * Saves a product entity
   * Creates new product if not exists, updates if exists
   * @param product - Product entity to save
   * @returns Promise that resolves when save is complete
   */
  save(product: Product): Promise<void>;

  /**
   * Finds a product by its ID
   * @param id - Product identifier
   * @returns Promise that resolves to Product entity or undefined if not found
   */
  findById(id: ProductId): Promise<Product | undefined>;

  /**
   * Finds all products
   * @returns Promise that resolves to array of Product entities
   */
  findAll(): Promise<Product[]>;

  /**
   * Checks if a product exists by ID
   * @param id - Product identifier
   * @returns Promise that resolves to true if product exists, false otherwise
   */
  exists(id: ProductId): Promise<boolean>;

  /**
   * Deletes a product by ID
   * @param id - Product identifier
   * @returns Promise that resolves when deletion is complete
   */
  delete(id: ProductId): Promise<void>;
}

export const ProductRepositoryToken = "ProductRepository";
