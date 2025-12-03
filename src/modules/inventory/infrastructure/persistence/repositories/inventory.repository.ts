import { Injectable, Inject } from "@nestjs/common";
import { InjectRepository, InjectDataSource } from "@nestjs/typeorm";
import { Repository, DataSource, QueryRunner } from "typeorm";
import { IInventoryRepository } from "src/modules/inventory/domain/repositories/inventory.repository.interface";
import { Inventory } from "src/modules/inventory/domain/entities/inventory.entity";
import { InventoryId } from "src/modules/inventory/domain/value-objects/inventory-id.vo";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
import { InventoryMapper } from "../mappers/inventory.mapper";
import { InventoryOrmEntity } from "../entities/inventory.orm-entity";
import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import {
  OutboxEventOrmEntity,
  OutboxEventStatus,
} from "src/shared/infrastructure/outbox/outbox-event.orm-entity";

/**
 * InventoryRepository implements IInventoryRepository using TypeORM
 * Handles persistence of Inventory aggregate root
 */
@Injectable()
export class InventoryRepository implements IInventoryRepository {
  constructor(
    @InjectRepository(InventoryOrmEntity)
    private readonly ormRepository: Repository<InventoryOrmEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Saves an inventory entity
   * Creates new inventory if not exists, updates if exists
   * Dispatches domain events to outbox in the same transaction
   * @param inventory - Inventory entity to save
   * @returns Promise that resolves when save is complete
   */
  async save(inventory: Inventory): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ormEntity = InventoryMapper.toPersistence(inventory);
      await queryRunner.manager.save(InventoryOrmEntity, ormEntity);

      // Pull and dispatch domain events in the same transaction
      const domainEvents = inventory.pullDomainEvents();
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
   * Finds inventory by its ID
   * @param id - Inventory identifier
   * @returns Promise that resolves to Inventory entity or undefined if not found
   */
  async findById(id: InventoryId): Promise<Inventory | undefined> {
    const ormEntity = await this.ormRepository.findOne({
      where: { id: id.getValue() },
    });
    if (!ormEntity) {
      return undefined;
    }
    return InventoryMapper.toDomain(ormEntity);
  }

  /**
   * Finds inventory by product ID
   * @param productId - Product identifier
   * @returns Promise that resolves to Inventory entity or undefined if not found
   */
  async findByProductId(productId: ProductId): Promise<Inventory | undefined> {
    const ormEntity = await this.ormRepository.findOne({
      where: { productId: productId.getValue() },
    });
    if (!ormEntity) {
      return undefined;
    }
    return InventoryMapper.toDomain(ormEntity);
  }

  /**
   * Checks if inventory exists by ID
   * @param id - Inventory identifier
   * @returns Promise that resolves to true if inventory exists, false otherwise
   */
  async exists(id: InventoryId): Promise<boolean> {
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
    if (eventAny.inventoryId) {
      const inventoryId = eventAny.inventoryId;
      if (typeof inventoryId === "string") {
        return inventoryId;
      }
      if (
        typeof inventoryId === "object" &&
        inventoryId !== null &&
        "getValue" in inventoryId &&
        typeof (inventoryId as { getValue: () => string }).getValue === "function"
      ) {
        return (inventoryId as { getValue: () => string }).getValue();
      }
    }
    if (eventAny.productId) {
      const productId = eventAny.productId;
      if (typeof productId === "string") {
        return productId;
      }
      if (
        typeof productId === "object" &&
        productId !== null &&
        "getValue" in productId &&
        typeof (productId as { getValue: () => string }).getValue === "function"
      ) {
        return (productId as { getValue: () => string }).getValue();
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

