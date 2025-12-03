import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ICartRepository } from "src/modules/cart/domain/repositories/cart.repository.interface";
import { Cart } from "src/modules/cart/domain/entities/cart.entity";
import { CartId } from "src/modules/cart/domain/value-objects/cart-id.vo";
import { UserId } from "src/modules/cart/domain/value-objects/user-id.vo";
import { CartMapper } from "../mappers/cart.mapper";
import { CartOrmEntity } from "../entities/cart.orm-entity";

/**
 * CartRepository implements ICartRepository using TypeORM
 * Handles persistence of Cart aggregate root
 */
@Injectable()
export class CartRepository implements ICartRepository {
  constructor(
    @InjectRepository(CartOrmEntity)
    private readonly ormRepository: Repository<CartOrmEntity>,
  ) {}

  /**
   * Saves a cart entity
   * Creates new cart if not exists, updates if exists
   * @param cart - Cart entity to save
   * @returns Promise that resolves when save is complete
   */
  async save(cart: Cart): Promise<void> {
    const ormEntity = CartMapper.toPersistence(cart);
    await this.ormRepository.save(ormEntity);
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

