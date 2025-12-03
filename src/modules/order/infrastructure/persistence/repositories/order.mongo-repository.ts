import { Injectable, Inject } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IOrderRepository } from "src/modules/order/domain/repositories/order.repository.interface";
import { Order } from "src/modules/order/domain/entities/order.entity";
import { OrderId } from "src/modules/order/domain/value-objects/order-id.vo";
import { UserId } from "src/modules/cart/domain/value-objects/user-id.vo";
import { OrderMongoMapper } from "../mappers/order.mongo-mapper";
import {
  OrderMongoEntity,
  OrderDocument,
} from "../entities/order.schema";
import type { IDomainEventDispatcher } from "src/shared/application/events/domain-event-dispatcher.interface";
import { DomainEventDispatcherToken } from "src/shared/application/events/domain-event-dispatcher.interface";

/**
 * OrderMongoRepository implements IOrderRepository using Mongoose
 * Handles persistence of Order aggregate root in MongoDB
 */
@Injectable()
export class OrderMongoRepository implements IOrderRepository {
  constructor(
    @InjectModel(OrderMongoEntity.name)
    private readonly mongoModel: Model<OrderDocument>,
    @Inject(DomainEventDispatcherToken)
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  /**
   * Saves an order entity
   * Creates new order if not exists, updates if exists
   * Dispatches domain events to outbox
   * @param order - Order entity to save
   * @returns Promise that resolves when save is complete
   */
  async save(order: Order): Promise<void> {
    const mongoEntity = OrderMongoMapper.toPersistence(order);
    await this.mongoModel.findByIdAndUpdate(
      order.getId().getValue(),
      mongoEntity,
      { upsert: true, new: true },
    );

    // Pull and dispatch domain events
    const domainEvents = order.pullDomainEvents();
    for (const event of domainEvents) {
      await this.eventDispatcher.dispatch(event);
    }
  }

  /**
   * Finds an order by its ID
   * @param id - Order identifier
   * @returns Promise that resolves to Order entity or undefined if not found
   */
  async findById(id: OrderId): Promise<Order | undefined> {
    const document = await this.mongoModel.findById(id.getValue()).exec();
    if (!document) {
      return undefined;
    }
    return OrderMongoMapper.toDomain(document);
  }

  /**
   * Finds all orders for a specific user
   * @param userId - User identifier
   * @returns Promise that resolves to array of Order entities
   */
  async findByUserId(userId: UserId): Promise<Order[]> {
    const documents = await this.mongoModel
      .find({ userId: userId.getValue() })
      .sort({ createdAt: -1 })
      .exec();
    return documents.map((document) => OrderMongoMapper.toDomain(document));
  }

  /**
   * Checks if an order exists by ID
   * @param id - Order identifier
   * @returns Promise that resolves to true if order exists, false otherwise
   */
  async exists(id: OrderId): Promise<boolean> {
    const count = await this.mongoModel.countDocuments({
      _id: id.getValue(),
    });
    return count > 0;
  }
}

