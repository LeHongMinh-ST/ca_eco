import { Injectable, Inject } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IInventoryRepository } from "src/modules/inventory/domain/repositories/inventory.repository.interface";
import { Inventory } from "src/modules/inventory/domain/entities/inventory.entity";
import { InventoryId } from "src/modules/inventory/domain/value-objects/inventory-id.vo";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
import { InventoryMongoMapper } from "../mappers/inventory.mongo-mapper";
import {
  InventoryMongoEntity,
  InventoryDocument,
} from "../entities/inventory.schema";
import type { IDomainEventDispatcher } from "src/shared/application/events/domain-event-dispatcher.interface";
import { DomainEventDispatcherToken } from "src/shared/application/events/domain-event-dispatcher.interface";

/**
 * InventoryMongoRepository implements IInventoryRepository using Mongoose
 * Handles persistence of Inventory aggregate root in MongoDB
 */
@Injectable()
export class InventoryMongoRepository implements IInventoryRepository {
  constructor(
    @InjectModel(InventoryMongoEntity.name)
    private readonly mongoModel: Model<InventoryDocument>,
    @Inject(DomainEventDispatcherToken)
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  /**
   * Saves an inventory entity
   * Creates new inventory if not exists, updates if exists
   * Dispatches domain events to outbox
   * @param inventory - Inventory entity to save
   * @returns Promise that resolves when save is complete
   */
  async save(inventory: Inventory): Promise<void> {
    const mongoEntity = InventoryMongoMapper.toPersistence(inventory);
    await this.mongoModel.findByIdAndUpdate(
      inventory.getId().getValue(),
      mongoEntity,
      { upsert: true, new: true },
    );

    // Pull and dispatch domain events
    const domainEvents = inventory.pullDomainEvents();
    for (const event of domainEvents) {
      await this.eventDispatcher.dispatch(event);
    }
  }

  /**
   * Finds inventory by its ID
   * @param id - Inventory identifier
   * @returns Promise that resolves to Inventory entity or undefined if not found
   */
  async findById(id: InventoryId): Promise<Inventory | undefined> {
    const document = await this.mongoModel.findById(id.getValue()).exec();
    if (!document) {
      return undefined;
    }
    return InventoryMongoMapper.toDomain(document);
  }

  /**
   * Finds inventory by product ID
   * @param productId - Product identifier
   * @returns Promise that resolves to Inventory entity or undefined if not found
   */
  async findByProductId(productId: ProductId): Promise<Inventory | undefined> {
    const document = await this.mongoModel
      .findOne({ productId: productId.getValue() })
      .exec();
    if (!document) {
      return undefined;
    }
    return InventoryMongoMapper.toDomain(document);
  }

  /**
   * Checks if inventory exists by ID
   * @param id - Inventory identifier
   * @returns Promise that resolves to true if inventory exists, false otherwise
   */
  async exists(id: InventoryId): Promise<boolean> {
    const count = await this.mongoModel.countDocuments({
      _id: id.getValue(),
    });
    return count > 0;
  }
}

