import { Injectable, Inject } from "@nestjs/common";
import { InjectRepository, InjectDataSource } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { IUserRepository } from "src/modules/user/domain/repositories/user.repository.interface";
import { User } from "src/modules/user/domain/entities/user.entity";
import { UserId } from "src/modules/user/domain/value-objects/user-id.vo";
import { UserEmail } from "src/modules/user/domain/value-objects/user-email.vo";
import { UserMapper } from "../mappers/user.mapper";
import { UserOrmEntity } from "../entities/user.orm-entity";
import type { IDomainEventDispatcher } from "src/shared/application/events/domain-event-dispatcher.interface";
import { DomainEventDispatcherToken } from "src/shared/application/events/domain-event-dispatcher.interface";

/**
 * UserRepository implements IUserRepository using TypeORM
 * Handles persistence of User aggregate root
 */
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly ormRepository: Repository<UserOrmEntity>,
    @Inject(DomainEventDispatcherToken)
    private readonly eventDispatcher: IDomainEventDispatcher,
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
      const domainEvents = user.pullDomainEvents();
      for (const event of domainEvents) {
        await this.eventDispatcher.dispatch(event);
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
}
