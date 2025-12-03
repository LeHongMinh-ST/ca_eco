import { Injectable, Inject } from "@nestjs/common";
import { InjectRepository, InjectDataSource } from "@nestjs/typeorm";
import { Repository, DataSource, QueryRunner } from "typeorm";
import { IOrderRepository } from "src/modules/order/domain/repositories/order.repository.interface";
import { Order } from "src/modules/order/domain/entities/order.entity";
import { OrderId } from "src/modules/order/domain/value-objects/order-id.vo";
import { UserId } from "src/modules/cart/domain/value-objects/user-id.vo";
import { OrderMapper } from "../mappers/order.mapper";
import { OrderOrmEntity } from "../entities/order.orm-entity";
import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import {
  OutboxEventOrmEntity,
  OutboxEventStatus,
} from "src/shared/infrastructure/outbox/outbox-event.orm-entity";

/**
 * OrderRepository implements IOrderRepository using TypeORM
 * Handles persistence of Order aggregate root
 */
@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly ormRepository: Repository<OrderOrmEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Saves an order entity
   * Creates new order if not exists, updates if exists
   * Dispatches domain events to outbox in the same transaction
   * @param order - Order entity to save
   * @returns Promise that resolves when save is complete
   */
  async save(order: Order): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ormEntity = OrderMapper.toPersistence(order);
      await queryRunner.manager.save(OrderOrmEntity, ormEntity);

      // Pull and dispatch domain events in the same transaction
      // Save events directly to outbox using queryRunner.manager to ensure same transaction
      const domainEvents = order.pullDomainEvents();
      for (const event of domainEvents) {
        await this.saveEventToOutbox(queryRunner, event);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Finds an order by its ID
   * @param id - Order identifier
   * @returns Promise that resolves to Order entity or undefined if not found
   */
  async findById(id: OrderId): Promise<Order | undefined> {
    const ormEntity = await this.ormRepository.findOne({
      where: { id: id.getValue() },
      relations: ["items"],
    });
    if (!ormEntity) {
      return undefined;
    }
    return OrderMapper.toDomain(ormEntity);
  }

  /**
   * Finds all orders for a specific user
   * @param userId - User identifier
   * @returns Promise that resolves to array of Order entities
   */
  async findByUserId(userId: UserId): Promise<Order[]> {
    const ormEntities = await this.ormRepository.find({
      where: { userId: userId.getValue() },
      relations: ["items"],
      order: { createdAt: "DESC" },
    });
    return ormEntities.map((ormEntity) => OrderMapper.toDomain(ormEntity));
  }

  /**
   * Checks if an order exists by ID
   * @param id - Order identifier
   * @returns Promise that resolves to true if order exists, false otherwise
   */
  async exists(id: OrderId): Promise<boolean> {
    const count = await this.ormRepository.count({
      where: { id: id.getValue() },
    });
    return count > 0;
  }

  /**
   * Saves domain event to outbox in the same transaction
   * @param queryRunner - QueryRunner for the current transaction
   * @param event - Domain event to save
   */
  private async saveEventToOutbox(
    queryRunner: QueryRunner,
    event: DomainEvent,
  ): Promise<void> {
    const aggregateId = this.extractAggregateId(event);
    const payload = this.serializeEvent(event);

    const outboxEvent = new OutboxEventOrmEntity();
    outboxEvent.aggregateId = aggregateId;
    outboxEvent.eventType = event.name;
    outboxEvent.payload = payload;
    outboxEvent.status = OutboxEventStatus.PENDING;
    outboxEvent.retryCount = 0;

    await queryRunner.manager.save(OutboxEventOrmEntity, outboxEvent);
  }

  /**
   * Extracts aggregate ID from domain event
   */
  private extractAggregateId(event: DomainEvent): string {
    const eventAny = event as unknown as Record<string, unknown>;
    if (eventAny.orderId) {
      const orderId = eventAny.orderId;
      if (typeof orderId === "string") {
        return orderId;
      }
      if (
        typeof orderId === "object" &&
        orderId !== null &&
        "getValue" in orderId &&
        typeof (orderId as { getValue: () => string }).getValue === "function"
      ) {
        return (orderId as { getValue: () => string }).getValue();
      }
    }
    return event.name;
  }

  /**
   * Serializes domain event to JSON payload
   */
  private serializeEvent(event: DomainEvent): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      name: event.name,
      occurredAt: event.occurredAt.toISOString(),
    };

    const eventAny = event as unknown as Record<string, unknown>;
    for (const key in eventAny) {
      if (key !== "name" && key !== "occurredAt") {
        const value = eventAny[key];
        if (
          value &&
          typeof value === "object" &&
          value !== null &&
          "getValue" in value &&
          typeof (value as { getValue: () => unknown }).getValue === "function"
        ) {
          payload[key] = (value as { getValue: () => unknown }).getValue();
        } else if (Array.isArray(value)) {
          payload[key] = value;
        } else {
          payload[key] = value;
        }
      }
    }

    return payload;
  }
}

