import { Product } from "src/modules/product/domain/entities/product.entity";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
import { ProductName } from "src/modules/product/domain/value-objects/product-name.vo";
import { ProductPrice } from "src/modules/product/domain/value-objects/product-price.vo";
import { ProductImage } from "src/modules/product/domain/value-objects/product-image.vo";
import {
  ProductMongoEntity,
  ProductDocument,
} from "../entities/product.schema";

/**
 * ProductMongoMapper converts between domain entities and MongoDB documents
 */
export class ProductMongoMapper {
  /**
   * Converts domain Product entity to MongoDB document
   * @param product - Domain Product entity
   * @returns ProductMongoEntity for MongoDB persistence
   */
  static toPersistence(product: Product): Partial<ProductMongoEntity> {
    return {
      _id: product.getId().getValue(),
      name: product.getName().getValue(),
      price: product.getPrice().getValue(),
      image: product.getImage().getValue(),
    };
  }

  /**
   * Converts MongoDB document to domain Product entity
   * @param document - ProductDocument from MongoDB
   * @returns Domain Product entity
   */
  static toDomain(document: ProductDocument | ProductMongoEntity): Product {
    const productId = ProductId.create(document._id);
    const name = ProductName.create(document.name);
    // MongoDB stores number as number, so no conversion needed
    const price = ProductPrice.create(document.price);
    const image = ProductImage.create(document.image);

    // Use reconstitute to avoid raising domain events when loading from database
    return Product.reconstitute(productId, name, price, image);
  }
}
