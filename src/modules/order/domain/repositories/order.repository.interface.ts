import { Order } from "../entities/order.entity";
import { OrderId } from "../value-objects/order-id.vo";
import { UserId } from "src/modules/cart/domain/value-objects/user-id.vo";

/**
 * IOrderRepository defines the contract for order persistence
 * Implementations should handle saving and retrieving Order aggregate roots
 */
export interface IOrderRepository {
  /**
   * Saves an order entity
   * Creates new order if not exists, updates if exists
   * @param order - Order entity to save
   * @returns Promise that resolves when save is complete
   */
  save(order: Order): Promise<void>;

  /**
   * Finds an order by its ID
   * @param id - Order identifier
   * @returns Promise that resolves to Order entity or undefined if not found
   */
  findById(id: OrderId): Promise<Order | undefined>;

  /**
   * Finds all orders for a specific user
   * @param userId - User identifier
   * @returns Promise that resolves to array of Order entities
   */
  findByUserId(userId: UserId): Promise<Order[]>;

  /**
   * Checks if an order exists by ID
   * @param id - Order identifier
   * @returns Promise that resolves to true if order exists, false otherwise
   */
  exists(id: OrderId): Promise<boolean>;
}

/**
 * Token for dependency injection
 */
export const OrderRepositoryToken = "IOrderRepository";

