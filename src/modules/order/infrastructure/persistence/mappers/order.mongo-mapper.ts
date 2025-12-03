import { Order } from "src/modules/order/domain/entities/order.entity";
import { OrderId } from "src/modules/order/domain/value-objects/order-id.vo";
import { OrderStatus } from "src/modules/order/domain/value-objects/order-status.vo";
import { OrderItem } from "src/modules/order/domain/value-objects/order-item.vo";
import { UserId } from "src/modules/cart/domain/value-objects/user-id.vo";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
import {
  OrderMongoEntity,
  OrderDocument,
} from "../entities/order.schema";

/**
 * OrderMongoMapper converts between domain entities and MongoDB documents
 */
export class OrderMongoMapper {
  /**
   * Converts domain Order entity to MongoDB document
   * @param order - Domain Order entity
   * @returns OrderMongoEntity for MongoDB persistence
   */
  static toPersistence(order: Order): Partial<OrderMongoEntity> {
    return {
      _id: order.getId().getValue(),
      userId: order.getUserId().getValue(),
      status: order.getStatus().getValue(),
      totalPrice: order.getTotalPrice(),
      items: order.getItems().map((item) => ({
        id: crypto.randomUUID(), // Generate ID for order item
        productId: item.getProductId().getValue(),
        productName: item.getProductName(),
        productPrice: item.getProductPrice(),
        quantity: item.getQuantity(),
        totalPrice: item.getTotalPrice(),
      })),
    };
  }

  /**
   * Converts MongoDB document to domain Order entity
   * @param document - OrderDocument from MongoDB
   * @returns Domain Order entity
   */
  static toDomain(document: OrderDocument | OrderMongoEntity): Order {
    const orderId = OrderId.create(document._id);
    const userId = UserId.create(document.userId);
    const status = OrderStatus.create(document.status);

    // Convert order items
    const items = document.items.map((item) => {
      const productId = ProductId.create(item.productId);
      return OrderItem.create(
        productId,
        item.productName,
        item.productPrice,
        item.quantity,
      );
    });

    // Use reconstitute to avoid raising domain events when loading from database
    return Order.reconstitute(
      orderId,
      userId,
      items,
      status,
      document.totalPrice,
      document.createdAt,
      document.updatedAt,
    );
  }
}

