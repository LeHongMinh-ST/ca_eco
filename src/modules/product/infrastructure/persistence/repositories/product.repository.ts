import { Injectable, Inject } from "@nestjs/common";
import { InjectRepository, InjectDataSource } from "@nestjs/typeorm";
import { Repository, DataSource, QueryRunner } from "typeorm";
import { IProductRepository } from "src/modules/product/domain/repositories/product.repository.interface";
import { Product } from "src/modules/product/domain/entities/product.entity";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
import { ProductMapper } from "../mappers/product.mapper";
import { ProductOrmEntity } from "../entities/product.orm-entity";
import type { IDomainEventDispatcher } from "src/shared/application/events/domain-event-dispatcher.interface";
import { DomainEventDispatcherToken } from "src/shared/application/events/domain-event-dispatcher.interface";
import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import {
  OutboxEventOrmEntity,
  OutboxEventStatus,
} from "src/shared/infrastructure/outbox/outbox-event.orm-entity";

/**
 * ProductRepository implements IProductRepository using TypeORM
 * Handles persistence of Product aggregate root
 */
@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly ormRepository: Repository<ProductOrmEntity>,
    @Inject(DomainEventDispatcherToken)
    private readonly eventDispatcher: IDomainEventDispatcher,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Saves a product entity
   * Creates new product if not exists, updates if exists
   * Dispatches domain events to outbox in the same transaction
   * @param product - Product entity to save
   * @returns Promise that resolves when save is complete
   */
  async save(product: Product): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ormEntity = ProductMapper.toPersistence(product);
      await queryRunner.manager.save(ProductOrmEntity, ormEntity);

      // Pull and dispatch domain events in the same transaction
      // Save events directly to outbox using queryRunner.manager to ensure same transaction
      const domainEvents = product.pullDomainEvents();
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
   * Finds a product by its ID
   * @param id - Product identifier
   * @returns Promise that resolves to Product entity or undefined if not found
   */
  async findById(id: ProductId): Promise<Product | undefined> {
    const ormEntity = await this.ormRepository.findOne({
      where: { id: id.getValue() },
    });

    if (!ormEntity) {
      return undefined;
    }

    return ProductMapper.toDomain(ormEntity);
  }

  /**
   * Finds all products
   * @returns Promise that resolves to array of Product entities
   */
  async findAll(): Promise<Product[]> {
    const ormEntities = await this.ormRepository.find();
    return ormEntities.map((ormEntity) => ProductMapper.toDomain(ormEntity));
  }

  /**
   * Checks if a product exists by ID
   * @param id - Product identifier
   * @returns Promise that resolves to true if product exists, false otherwise
   */
  async exists(id: ProductId): Promise<boolean> {
    const count = await this.ormRepository.count({
      where: { id: id.getValue() },
    });
    return count > 0;
  }

  /**
   * Deletes a product by ID
   * @param id - Product identifier
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: ProductId): Promise<void> {
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
    if ((event as any).productId) {
      const productId = (event as any).productId;
      return typeof productId === "string"
        ? productId
        : productId.getValue();
    }
    return event.name;
  }

  /**
   * Serializes domain event to JSON payload
   */
  private serializeEvent(event: DomainEvent): Record<string, any> {
    const payload: Record<string, any> = {
      name: event.name,
      occurredAt: event.occurredAt.toISOString(),
    };

    for (const key in event) {
      if (key !== "name" && key !== "occurredAt") {
        const value = (event as any)[key];
        if (value && typeof value === "object" && "getValue" in value) {
          payload[key] = value.getValue();
        } else {
          payload[key] = value;
        }
      }
    }

    return payload;
  }
}
