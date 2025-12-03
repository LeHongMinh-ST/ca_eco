import { Injectable, Inject } from "@nestjs/common";
import { InjectRepository, InjectDataSource } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { ICartRepository } from "src/modules/cart/domain/repositories/cart.repository.interface";
import { Cart } from "src/modules/cart/domain/entities/cart.entity";
import { CartId } from "src/modules/cart/domain/value-objects/cart-id.vo";
import { UserId } from "src/modules/cart/domain/value-objects/user-id.vo";
import { CartMapper } from "../mappers/cart.mapper";
import { CartOrmEntity } from "../entities/cart.orm-entity";
import type { IDomainEventDispatcher } from "src/shared/application/events/domain-event-dispatcher.interface";
import { DomainEventDispatcherToken } from "src/shared/application/events/domain-event-dispatcher.interface";

/**
 * CartRepository implements ICartRepository using TypeORM
 * Handles persistence of Cart aggregate root
 */
@Injectable()
export class CartRepository implements ICartRepository {
  constructor(
    @InjectRepository(CartOrmEntity)
    private readonly ormRepository: Repository<CartOrmEntity>,
    @Inject(DomainEventDispatcherToken)
    private readonly eventDispatcher: IDomainEventDispatcher,
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
      const domainEvents = cart.pullDomainEvents();
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
}

