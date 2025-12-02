import { BaseEntity } from "src/shared/domain/entities/base.entity";
import { ProductCreated } from "../events/product-created.event";
import { ProductPriceUpdated } from "../events/product-price-updated.event";
import { ProductId } from "../value-objects/product-id.vo";
import { ProductImage } from "../value-objects/product-image.vo";
import { ProductName } from "../value-objects/product-name.vo";
import { ProductPrice } from "../value-objects/product-price.vo";

/**
 * Product aggregate root entity
 * Encapsulates product business logic and invariants
 * Note: Quantity management is handled by Inventory module
 */
export class Product extends BaseEntity<ProductId> {
  private name: ProductName;
  private price: ProductPrice;
  private image: ProductImage;

  private constructor(
    id: ProductId,
    name: ProductName,
    price: ProductPrice,
    image: ProductImage,
  ) {
    super(id);
    this.name = name;
    this.price = price;
    this.image = image;
  }

  /**
   * Factory method to create a new Product instance
   * Raises ProductCreated domain event
   */
  static create(
    id: ProductId,
    name: ProductName,
    price: ProductPrice,
    image: ProductImage,
  ): Product {
    const product = new Product(id, name, price, image);
    product.recordEvent(new ProductCreated(id));
    return product;
  }

  /**
   * Updates product price and raises domain event if price changed
   */
  updatePrice(newPrice: ProductPrice): void {
    if (this.price.getValue() === newPrice.getValue()) {
      return; // No change, skip event
    }

    const oldPrice = this.price;
    this.price = newPrice;
    this.recordEvent(
      new ProductPriceUpdated(this.getId(), oldPrice, newPrice),
    );
  }

  /**
   * Updates product name
   */
  updateName(newName: ProductName): void {
    this.name = newName;
  }

  /**
   * Updates product image URL
   */
  updateImage(newImage: ProductImage): void {
    this.image = newImage;
  }

  /**
   * Gets product name value object
   */
  getName(): ProductName {
    return this.name;
  }

  /**
   * Gets product price value object
   */
  getPrice(): ProductPrice {
    return this.price;
  }

  /**
   * Gets product image value object
   */
  getImage(): ProductImage {
    return this.image;
  }

  /**
   * Compares two Product entities for equality based on ID
   */
  equals(other: Product): boolean {
    if (!other) {
      return false;
    }
    return this.getId().equals(other.getId());
  }
}
