import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ICartRepository } from "src/modules/cart/domain/repositories/cart.repository.interface";
import { Cart } from "src/modules/cart/domain/entities/cart.entity";
import { CartId } from "src/modules/cart/domain/value-objects/cart-id.vo";
import { UserId } from "src/modules/cart/domain/value-objects/user-id.vo";
import { CartMongoMapper } from "../mappers/cart.mongo-mapper";
import {
  CartMongoEntity,
  CartDocument,
} from "../entities/cart.schema";

/**
 * CartMongoRepository implements ICartRepository using Mongoose
 * Handles persistence of Cart aggregate root in MongoDB
 */
@Injectable()
export class CartMongoRepository implements ICartRepository {
  constructor(
    @InjectModel(CartMongoEntity.name)
    private readonly mongoModel: Model<CartDocument>,
  ) {}

  /**
   * Saves a cart entity
   * Creates new cart if not exists, updates if exists
   * @param cart - Cart entity to save
   * @returns Promise that resolves when save is complete
   */
  async save(cart: Cart): Promise<void> {
    const mongoEntity = CartMongoMapper.toPersistence(cart);
    await this.mongoModel.findByIdAndUpdate(
      cart.getId().getValue(),
      mongoEntity,
      { upsert: true, new: true },
    );
  }

  /**
   * Finds a cart by its ID
   * @param id - Cart identifier
   * @returns Promise that resolves to Cart entity or undefined if not found
   */
  async findById(id: CartId): Promise<Cart | undefined> {
    const document = await this.mongoModel.findById(id.getValue()).exec();

    if (!document) {
      return undefined;
    }

    return CartMongoMapper.toDomain(document);
  }

  /**
   * Finds a cart by user ID
   * @param userId - User identifier
   * @returns Promise that resolves to Cart entity or undefined if not found
   */
  async findByUserId(userId: UserId): Promise<Cart | undefined> {
    const document = await this.mongoModel
      .findOne({ userId: userId.getValue() })
      .exec();

    if (!document) {
      return undefined;
    }

    return CartMongoMapper.toDomain(document);
  }

  /**
   * Checks if a cart exists by ID
   * @param id - Cart identifier
   * @returns Promise that resolves to true if cart exists, false otherwise
   */
  async exists(id: CartId): Promise<boolean> {
    const count = await this.mongoModel.countDocuments({
      _id: id.getValue(),
    });
    return count > 0;
  }

  /**
   * Deletes a cart by ID
   * @param id - Cart identifier
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: CartId): Promise<void> {
    await this.mongoModel.findByIdAndDelete(id.getValue()).exec();
  }
}

