import { Order } from "src/modules/order/domain/entities/order.entity";
import { OrderId } from "src/modules/order/domain/value-objects/order-id.vo";
import { OrderStatus } from "src/modules/order/domain/value-objects/order-status.vo";
import { OrderItem } from "src/modules/order/domain/value-objects/order-item.vo";
import { UserId } from "src/modules/cart/domain/value-objects/user-id.vo";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
import { OrderOrmEntity } from "../entities/order.orm-entity";
import { OrderItemOrmEntity } from "../entities/order-item.orm-entity";

/**
 * OrderMapper converts between domain entities and TypeORM entities
 */
export class OrderMapper {
  /**
   * Converts domain Order entity to TypeORM entity
   * @param order - Domain Order entity
   * @returns OrderOrmEntity for TypeORM persistence
   */
  static toPersistence(order: Order): Partial<OrderOrmEntity> {
    return {
      id: order.getId().getValue(),
      userId: order.getUserId().getValue(),
      status: order.getStatus().getValue(),
      totalPrice: order.getTotalPrice(),
      sourceCartId: order.getSourceCartId() ?? null,
      items: order.getItems().map((item) => ({
        id: crypto.randomUUID(), // Generate ID for order item
        orderId: order.getId().getValue(),
        productId: item.getProductId().getValue(),
        productName: item.getProductName(),
        productPrice: item.getProductPrice(),
        quantity: item.getQuantity(),
        totalPrice: item.getTotalPrice(),
      })) as OrderItemOrmEntity[],
    };
  }

  /**
   * Converts TypeORM entity to domain Order entity
   * @param ormEntity - OrderOrmEntity from TypeORM
   * @returns Domain Order entity
   */
  static toDomain(ormEntity: OrderOrmEntity): Order {
    const orderId = OrderId.create(ormEntity.id);
    const userId = UserId.create(ormEntity.userId);
    const status = OrderStatus.create(ormEntity.status);

    // Convert order items
    const items = ormEntity.items.map((item) => {
      const productId = ProductId.create(item.productId);
      const productPrice =
        typeof item.productPrice === "string"
          ? parseFloat(item.productPrice)
          : item.productPrice;
      return OrderItem.create(
        productId,
        item.productName,
        productPrice,
        item.quantity,
      );
    });

    // Calculate total price from items if not set
    const totalPrice =
      typeof ormEntity.totalPrice === "string"
        ? parseFloat(ormEntity.totalPrice)
        : ormEntity.totalPrice;

    // Use reconstitute to avoid raising domain events when loading from database
    return Order.reconstitute(
      orderId,
      userId,
      items,
      status,
      totalPrice,
      ormEntity.createdAt,
      ormEntity.updatedAt,
      ormEntity.sourceCartId ?? undefined,
    );
  }
}

