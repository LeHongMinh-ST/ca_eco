import { Product } from "src/modules/product/domain/entities/product.entity";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
import { ProductName } from "src/modules/product/domain/value-objects/product-name.vo";
import { ProductPrice } from "src/modules/product/domain/value-objects/product-price.vo";
import { ProductImage } from "src/modules/product/domain/value-objects/product-image.vo";
import { ProductOrmEntity } from "../entities/product.orm-entity";

/**
 * ProductMapper converts between domain entities and persistence entities
 */
export class ProductMapper {
  /**
   * Converts domain Product entity to persistence ProductOrmEntity
   * @param product - Domain Product entity
   * @returns ProductOrmEntity for database persistence
   */
  static toPersistence(product: Product): ProductOrmEntity {
    const ormEntity = new ProductOrmEntity();
    ormEntity.id = product.getId().getValue();
    ormEntity.name = product.getName().getValue();
    ormEntity.price = product.getPrice().getValue();
    ormEntity.image = product.getImage().getValue();
    return ormEntity;
  }

  /**
   * Converts persistence ProductOrmEntity to domain Product entity
   * @param ormEntity - ProductOrmEntity from database
   * @returns Domain Product entity
   */
  static toDomain(ormEntity: ProductOrmEntity): Product {
    const productId = ProductId.create(ormEntity.id);
    const name = ProductName.create(ormEntity.name);
    // Convert price from string (PostgreSQL DECIMAL) to number
    const priceValue =
      typeof ormEntity.price === "string"
        ? parseFloat(ormEntity.price)
        : ormEntity.price;
    const price = ProductPrice.create(priceValue);
    const image = ProductImage.create(ormEntity.image);

    // Use reconstitute to avoid raising domain events when loading from database
    return Product.reconstitute(productId, name, price, image);
  }
}
