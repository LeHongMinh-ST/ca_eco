/**
 * ICartServicePort defines the interface for cart operations
 * This is a port in the Ports and Adapters pattern
 * Implementation should be in infrastructure layer
 */
export interface ICartServicePort {
  /**
   * Gets cart information by cart ID
   * @param cartId - Cart identifier
   * @returns Promise that resolves to cart info or undefined if not found
   */
  getCartById(cartId: string): Promise<CartInfo | undefined>;

  /**
   * Clears all items from a cart
   * @param cartId - Cart identifier
   * @returns Promise that resolves when cart is cleared
   */
  clearCart(cartId: string): Promise<void>;
}

/**
 * Cart information DTO
 */
export interface CartInfo {
  readonly id: string;
  readonly userId: string;
  readonly items: Array<{
    productId: string;
    productName: string;
    productPrice: number;
    quantity: number;
  }>;
  readonly totalPrice: number;
}

/**
 * Token for dependency injection
 */
export const CartServicePortToken = "ICartServicePort";

