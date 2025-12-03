import { Injectable, Inject } from "@nestjs/common";
import { InjectRepository, InjectDataSource } from "@nestjs/typeorm";
import { Repository, DataSource, QueryRunner } from "typeorm";
import { ICartRepository } from "src/modules/cart/domain/repositories/cart.repository.interface";
import { Cart } from "src/modules/cart/domain/entities/cart.entity";
import { CartId } from "src/modules/cart/domain/value-objects/cart-id.vo";
import { UserId } from "src/modules/cart/domain/value-objects/user-id.vo";
import { CartMapper } from "../mappers/cart.mapper";
import { CartOrmEntity } from "../entities/cart.orm-entity";
import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import {
  OutboxEventOrmEntity,
  OutboxEventStatus,
} from "src/shared/infrastructure/outbox/outbox-event.orm-entity";

/**
 * CartRepository implements ICartRepository using TypeORM
 * Handles persistence of Cart aggregate root
 */
@Injectable()
export class CartRepository implements ICartRepository {
  constructor(
    @InjectRepository(CartOrmEntity)
    private readonly ormRepository: Repository<CartOrmEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Saves a cart entity
   * Creates new cart if not exists, updates if exists
   * Dispatches domain events to outbox in the same transaction
   * @param cart - Cart entity to save
   * @returns Promise that resolves when save is complete
   */
  async save(cart: Cart): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ormEntity = CartMapper.toPersistence(cart);
      await queryRunner.manager.save(CartOrmEntity, ormEntity);

      // Pull and dispatch domain events in the same transaction
      // Save events directly to outbox using queryRunner.manager to ensure same transaction
      const domainEvents = cart.pullDomainEvents();
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
   * Finds a cart by its ID
   * @param id - Cart identifier
   * @returns Promise that resolves to Cart entity or undefined if not found
   */
  async findById(id: CartId): Promise<Cart | undefined> {
    const ormEntity = await this.ormRepository.findOne({
      where: { id: id.getValue() },
      relations: ["items"],
    });

    if (!ormEntity) {
      return undefined;
    }

    return CartMapper.toDomain(ormEntity);
  }

  /**
   * Finds a cart by user ID
   * @param userId - User identifier
   * @returns Promise that resolves to Cart entity or undefined if not found
   */
  async findByUserId(userId: UserId): Promise<Cart | undefined> {
    const ormEntity = await this.ormRepository.findOne({
      where: { userId: userId.getValue() },
      relations: ["items"],
    });

    if (!ormEntity) {
      return undefined;
    }

    return CartMapper.toDomain(ormEntity);
  }

  /**
   * Checks if a cart exists by ID
   * @param id - Cart identifier
   * @returns Promise that resolves to true if cart exists, false otherwise
   */
  async exists(id: CartId): Promise<boolean> {
    const count = await this.ormRepository.count({
      where: { id: id.getValue() },
    });
    return count > 0;
  }

  /**
   * Deletes a cart by ID
   * @param id - Cart identifier
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: CartId): Promise<void> {
    await this.ormRepository.delete(id.getValue());
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
    if (eventAny.cartId) {
      const cartId = eventAny.cartId;
      if (typeof cartId === "string") {
        return cartId;
      }
      if (
        typeof cartId === "object" &&
        cartId !== null &&
        "getValue" in cartId &&
        typeof (cartId as { getValue: () => string }).getValue === "function"
      ) {
        return (cartId as { getValue: () => string }).getValue();
      }
    }
    if (eventAny.userId) {
      const userId = eventAny.userId;
      if (typeof userId === "string") {
        return userId;
      }
      if (
        typeof userId === "object" &&
        userId !== null &&
        "getValue" in userId &&
        typeof (userId as { getValue: () => string }).getValue === "function"
      ) {
        return (userId as { getValue: () => string }).getValue();
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
        } else {
          payload[key] = value;
        }
      }
    }

    return payload;
  }
}

