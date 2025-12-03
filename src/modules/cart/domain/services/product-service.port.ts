/**
 * ProductServicePort defines the interface for getting product information
 * This is a port in Hexagonal Architecture pattern
 * Implementation will be provided in infrastructure layer as adapter
 */
export interface IProductServicePort {
  /**
   * Gets product information by product ID
   * Used to create product snapshot when adding item to cart
   * @param productId - Product identifier
   * @returns Promise that resolves to product information or undefined if not found
   */
  getProductInfo(productId: string): Promise<ProductInfo | undefined>;
}

/**
 * ProductInfo represents the product information needed for cart
 */
export interface ProductInfo {
  readonly id: string;
  readonly name: string;
  price: number;
  image: string;
}

export const ProductServicePortToken = "IProductServicePort";
