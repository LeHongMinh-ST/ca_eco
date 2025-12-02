import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";
import { BaseEntity } from "src/shared/domain/entities/base.entity";
import { UserId } from "src/modules/user/domain/value-objects/user-id.vo";
import { CartCleared } from "../events/cart-cleared.event";
import { CartCreated } from "../events/cart-created.event";
import { CartItemAdded } from "../events/cart-item-added.event";
import { CartItemRemoved } from "../events/cart-item-removed.event";
import { CartItemUpdated } from "../events/cart-item-updated.event";
import { CartId } from "../value-objects/cart-id.vo";
import { CartItemId } from "../value-objects/cart-item-id.vo";
import { CartQuantity } from "../value-objects/cart-quantity.vo";
import { ProductSnapshot } from "../value-objects/product-snapshot.vo";
import { CartItem } from "./cart-item.entity";

/**
 * Cart aggregate root entity
 * Manages shopping cart items and operations
 */
export class Cart extends BaseEntity<CartId> {
  private readonly userId: UserId;
  private items: Map<string, CartItem>; // Key: CartItemId value

  private constructor(id: CartId, userId: UserId) {
    super(id);
    this.userId = userId;
    this.items = new Map();
  }

  /**
   * Factory method to create a new Cart instance
   * Raises CartCreated domain event
   */
  static create(id: CartId, userId: UserId): Cart {
    const cart = new Cart(id, userId);
    cart.recordEvent(new CartCreated(id, userId));
    return cart;
  }

  /**
   * Adds a product to cart or updates quantity if product already exists
   * Raises CartItemAdded or CartItemUpdated domain event
   */
  addItem(
    itemId: CartItemId,
    productSnapshot: ProductSnapshot,
    quantity: CartQuantity,
  ): void {
    // Check if product already exists in cart
    const productId = productSnapshot.productId;
    const existingItem = this.findItemByProductId(productId);

    if (existingItem) {
      // Update quantity by adding new quantity to existing
      const newQuantity = CartQuantity.create(
        existingItem.getQuantity().getValue() + quantity.getValue(),
      );
      const updatedItem = existingItem.updateQuantity(newQuantity);
      this.items.set(existingItem.getId().getValue(), updatedItem);

      this.recordEvent(
        new CartItemUpdated(
          this.getId(),
          existingItem.getId(),
          existingItem.getQuantity(),
          newQuantity,
        ),
      );
    } else {
      // Add new item
      const newItem = CartItem.create(itemId, productSnapshot, quantity);
      this.items.set(itemId.getValue(), newItem);

      this.recordEvent(new CartItemAdded(this.getId(), newItem));
    }
  }

  /**
   * Updates cart item quantity
   * Raises CartItemUpdated domain event
   */
  updateItemQuantity(itemId: CartItemId, newQuantity: CartQuantity): void {
    const item = this.items.get(itemId.getValue());
    if (!item) {
      throw new InvalidInputError(
        "Cart item not found",
        "itemId",
        itemId.getValue(),
      );
    }

    const oldQuantity = item.getQuantity();
    const updatedItem = item.updateQuantity(newQuantity);
    this.items.set(itemId.getValue(), updatedItem);

    this.recordEvent(
      new CartItemUpdated(this.getId(), itemId, oldQuantity, newQuantity),
    );
  }

  /**
   * Removes an item from cart
   * Raises CartItemRemoved domain event
   */
  removeItem(itemId: CartItemId): void {
    const item = this.items.get(itemId.getValue());
    if (!item) {
      throw new InvalidInputError(
        "Cart item not found",
        "itemId",
        itemId.getValue(),
      );
    }

    const productId = item.getProductSnapshot().productId;
    this.items.delete(itemId.getValue());

    this.recordEvent(
      new CartItemRemoved(this.getId(), itemId, productId),
    );
  }

  /**
   * Removes all items from cart
   * Raises CartCleared domain event
   */
  clear(): void {
    if (this.items.size === 0) {
      return; // Already empty, skip event
    }

    this.items.clear();
    this.recordEvent(new CartCleared(this.getId()));
  }

  /**
   * Finds cart item by product ID
   */
  findItemByProductId(productId: string): CartItem | undefined {
    for (const item of this.items.values()) {
      if (item.getProductSnapshot().productId === productId) {
        return item;
      }
    }
    return undefined;
  }

  /**
   * Gets cart item by ID
   */
  getItem(itemId: CartItemId): CartItem | undefined {
    return this.items.get(itemId.getValue());
  }

  /**
   * Gets all cart items as array
   */
  getItems(): CartItem[] {
    return Array.from(this.items.values());
  }

  /**
   * Gets total number of items in cart (sum of quantities)
   */
  getTotalItemsCount(): number {
    return Array.from(this.items.values()).reduce(
      (total, item) => total + item.getQuantity().getValue(),
      0,
    );
  }

  /**
   * Gets total number of unique products in cart
   */
  getUniqueItemsCount(): number {
    return this.items.size;
  }

  /**
   * Calculates total price of all items in cart
   */
  getTotalPrice(): number {
    return Array.from(this.items.values()).reduce(
      (total, item) => total + item.getTotalPrice(),
      0,
    );
  }

  /**
   * Checks if cart is empty
   */
  isEmpty(): boolean {
    return this.items.size === 0;
  }

  /**
   * Checks if cart contains a specific product
   */
  containsProduct(productId: string): boolean {
    return this.findItemByProductId(productId) !== undefined;
  }

  /**
   * Gets user ID
   */
  getUserId(): UserId {
    return this.userId;
  }

  /**
   * Compares two Cart entities for equality based on ID
   */
  equals(other: Cart): boolean {
    if (!other) {
      return false;
    }
    return this.getId().equals(other.getId());
  }
}
