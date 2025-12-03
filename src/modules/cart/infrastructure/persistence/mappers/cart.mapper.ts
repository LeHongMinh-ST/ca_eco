import { Cart } from "src/modules/cart/domain/entities/cart.entity";
import { CartId } from "src/modules/cart/domain/value-objects/cart-id.vo";
import { UserId } from "src/modules/cart/domain/value-objects/user-id.vo";
import { CartItemId } from "src/modules/cart/domain/value-objects/cart-item-id.vo";
import { CartQuantity } from "src/modules/cart/domain/value-objects/cart-quantity.vo";
import { ProductSnapshot } from "src/modules/cart/domain/value-objects/product-snapshot.vo";
import { CartOrmEntity } from "../entities/cart.orm-entity";
import { CartItemOrmEntity } from "../entities/cart-item.orm-entity";

/**
 * CartMapper converts between domain entities and persistence entities
 */
export class CartMapper {
  /**
   * Converts domain Cart entity to persistence CartOrmEntity
   * @param cart - Domain Cart entity
   * @returns CartOrmEntity for database persistence
   */
  static toPersistence(cart: Cart): CartOrmEntity {
    const ormEntity = new CartOrmEntity();
    ormEntity.id = cart.getId().getValue();
    ormEntity.userId = cart.getUserId().getValue();
    ormEntity.items = cart.getItems().map((item) => {
      const itemOrm = new CartItemOrmEntity();
      itemOrm.id = item.getId().getValue();
      itemOrm.cartId = cart.getId().getValue();
      const snapshot = item.getProductSnapshot();
      itemOrm.productId = snapshot.productId;
      itemOrm.productName = snapshot.name;
      itemOrm.productPrice = snapshot.price;
      itemOrm.productImage = snapshot.image;
      itemOrm.quantity = item.getQuantity().getValue();
      return itemOrm;
    });
    return ormEntity;
  }

  /**
   * Converts persistence CartOrmEntity to domain Cart entity
   * @param ormEntity - CartOrmEntity from database
   * @returns Domain Cart entity
   */
  static toDomain(ormEntity: CartOrmEntity): Cart {
    const cartId = CartId.create(ormEntity.id);
    const userId = UserId.create(ormEntity.userId);

    // Reconstitute cart
    const cart = Cart.reconstitute(cartId, userId);

    // Add items to cart (events will be raised but cleared after)
    if (ormEntity.items && ormEntity.items.length > 0) {
      ormEntity.items.forEach((itemOrm) => {
        const itemId = CartItemId.create(itemOrm.id);
        const productSnapshot = new ProductSnapshot(
          itemOrm.productId,
          itemOrm.productName,
          typeof itemOrm.productPrice === "string"
            ? parseFloat(itemOrm.productPrice)
            : itemOrm.productPrice,
          itemOrm.productImage,
        );
        const quantity = CartQuantity.create(itemOrm.quantity);
        cart.addItem(itemId, productSnapshot, quantity);
      });
      // Clear events that were raised during reconstitution
      cart.pullDomainEvents();
    }

    return cart;
  }
}

