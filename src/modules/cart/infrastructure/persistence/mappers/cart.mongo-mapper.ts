import { Cart } from "src/modules/cart/domain/entities/cart.entity";
import { CartId } from "src/modules/cart/domain/value-objects/cart-id.vo";
import { UserId } from "src/modules/cart/domain/value-objects/user-id.vo";
import { CartItemId } from "src/modules/cart/domain/value-objects/cart-item-id.vo";
import { CartQuantity } from "src/modules/cart/domain/value-objects/cart-quantity.vo";
import { ProductSnapshot } from "src/modules/cart/domain/value-objects/product-snapshot.vo";
import {
  CartMongoEntity,
  CartDocument,
} from "../entities/cart.schema";

/**
 * CartMongoMapper converts between domain entities and MongoDB documents
 */
export class CartMongoMapper {
  /**
   * Converts domain Cart entity to MongoDB document
   * @param cart - Domain Cart entity
   * @returns Partial<CartMongoEntity> for MongoDB persistence
   */
  static toPersistence(cart: Cart): Partial<CartMongoEntity> {
    return {
      _id: cart.getId().getValue(),
      userId: cart.getUserId().getValue(),
      items: cart.getItems().map((item) => {
        const snapshot = item.getProductSnapshot();
        return {
          id: item.getId().getValue(),
          productId: snapshot.productId,
          productName: snapshot.name,
          productPrice: snapshot.price,
          productImage: snapshot.image,
          quantity: item.getQuantity().getValue(),
        };
      }),
    };
  }

  /**
   * Converts MongoDB document to domain Cart entity
   * @param document - CartDocument from MongoDB
   * @returns Domain Cart entity
   */
  static toDomain(document: CartDocument | CartMongoEntity): Cart {
    const cartId = CartId.create(document._id);
    const userId = UserId.create(document.userId);

    // Reconstitute cart
    const cart = Cart.reconstitute(cartId, userId);

    // Add items to cart (events will be raised but cleared after)
    if (document.items && document.items.length > 0) {
      document.items.forEach((itemDoc) => {
        const itemId = CartItemId.create(itemDoc.id);
        const productSnapshot = new ProductSnapshot(
          itemDoc.productId,
          itemDoc.productName,
          itemDoc.productPrice,
          itemDoc.productImage,
        );
        const quantity = CartQuantity.create(itemDoc.quantity);
        cart.addItem(itemId, productSnapshot, quantity);
      });
      // Clear events that were raised during reconstitution
      cart.pullDomainEvents();
    }

    return cart;
  }
}

