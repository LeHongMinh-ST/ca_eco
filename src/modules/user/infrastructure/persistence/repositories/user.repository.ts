import { Injectable } from "@nestjs/common";
import { InjectRepository, InjectDataSource } from "@nestjs/typeorm";
import { Repository, DataSource, QueryRunner } from "typeorm";
import { IUserRepository } from "src/modules/user/domain/repositories/user.repository.interface";
import { User } from "src/modules/user/domain/entities/user.entity";
import { UserId } from "src/modules/user/domain/value-objects/user-id.vo";
import { UserEmail } from "src/modules/user/domain/value-objects/user-email.vo";
import { UserMapper } from "../mappers/user.mapper";
import { UserOrmEntity } from "../entities/user.orm-entity";
import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import {
  OutboxEventOrmEntity,
  OutboxEventStatus,
} from "src/shared/infrastructure/outbox/outbox-event.orm-entity";

/**
 * UserRepository implements IUserRepository using TypeORM
 * Handles persistence of User aggregate root
 */
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly ormRepository: Repository<UserOrmEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Saves a user entity
   * Creates new user if not exists, updates if exists
   * Dispatches domain events to outbox in the same transaction
   * @param user - User entity to save
   * @returns Promise that resolves when save is complete
   */
  async save(user: User): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ormEntity = UserMapper.toPersistence(user);
      await queryRunner.manager.save(UserOrmEntity, ormEntity);

      // Pull and dispatch domain events in the same transaction
      // Save events directly to outbox using queryRunner.manager to ensure same transaction
      const domainEvents = user.pullDomainEvents();
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
   * Finds a user by its ID
   * @param id - User identifier
   * @returns Promise that resolves to User entity or undefined if not found
   */
  async findById(id: UserId): Promise<User | undefined> {
    const ormEntity = await this.ormRepository.findOne({
      where: { id: id.getValue() },
    });
    if (!ormEntity) {
      return undefined;
    }
    return UserMapper.toDomain(ormEntity);
  }

  /**
   * Finds a user by email
   * @param email - User email
   * @returns Promise that resolves to User entity or undefined if not found
   */
  async findByEmail(email: UserEmail): Promise<User | undefined> {
    const ormEntity = await this.ormRepository.findOne({
      where: { email: email.getValue() },
    });
    if (!ormEntity) {
      return undefined;
    }
    return UserMapper.toDomain(ormEntity);
  }

  /**
   * Checks if a user exists by ID
   * @param id - User identifier
   * @returns Promise that resolves to true if user exists, false otherwise
   */
  async exists(id: UserId): Promise<boolean> {
    const count = await this.ormRepository.count({
      where: { id: id.getValue() },
    });
    return count > 0;
  }

  /**
   * Checks if a user exists by email
   * @param email - User email
   * @returns Promise that resolves to true if user exists, false otherwise
   */
  async existsByEmail(email: UserEmail): Promise<boolean> {
    const count = await this.ormRepository.count({
      where: { email: email.getValue() },
    });
    return count > 0;
  }

  /**
   * Deletes a user by ID
   * @param id - User identifier
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: UserId): Promise<void> {
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
