import { Cart } from "../entities/cart.entity";
import { CartId } from "../value-objects/cart-id.vo";
import { UserId } from "../value-objects/user-id.vo";

/**
 * CartRepository interface defines contract for cart persistence
 * Implementation should be provided in infrastructure layer
 */
export interface ICartRepository {
  /**
   * Saves a cart entity
   * Creates new cart if not exists, updates if exists
   * @param cart - Cart entity to save
   * @returns Promise that resolves when save is complete
   */
  save(cart: Cart): Promise<void>;

  /**
   * Finds a cart by its ID
   * @param id - Cart identifier
   * @returns Promise that resolves to Cart entity or undefined if not found
   */
  findById(id: CartId): Promise<Cart | undefined>;

  /**
   * Finds a cart by user ID
   * @param userId - User identifier
   * @returns Promise that resolves to Cart entity or undefined if not found
   */
  findByUserId(userId: UserId): Promise<Cart | undefined>;

  /**
   * Checks if a cart exists by ID
   * @param id - Cart identifier
   * @returns Promise that resolves to true if cart exists, false otherwise
   */
  exists(id: CartId): Promise<boolean>;

  /**
   * Deletes a cart by ID
   * @param id - Cart identifier
   * @returns Promise that resolves when deletion is complete
   */
  delete(id: CartId): Promise<void>;
}

export const CartRepositoryToken = "ICartRepository";
