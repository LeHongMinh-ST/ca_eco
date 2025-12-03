import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IProductRepository } from "src/modules/product/domain/repositories/product.repository.interface";
import { Product } from "src/modules/product/domain/entities/product.entity";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
import { ProductMongoMapper } from "../mappers/product.mongo-mapper";
import {
  ProductMongoEntity,
  ProductDocument,
} from "../entities/product.schema";

/**
 * ProductMongoRepository implements IProductRepository using Mongoose
 * Handles persistence of Product aggregate root in MongoDB
 */
@Injectable()
export class ProductMongoRepository implements IProductRepository {
  constructor(
    @InjectModel(ProductMongoEntity.name)
    private readonly mongoModel: Model<ProductDocument>,
  ) {}

  /**
   * Saves a product entity
   * Creates new product if not exists, updates if exists
   * @param product - Product entity to save
   * @returns Promise that resolves when save is complete
   */
  async save(product: Product): Promise<void> {
    const mongoEntity = ProductMongoMapper.toPersistence(product);
    await this.mongoModel.findByIdAndUpdate(
      product.getId().getValue(),
      mongoEntity,
      { upsert: true, new: true },
    );
  }

  /**
   * Finds a product by its ID
   * @param id - Product identifier
   * @returns Promise that resolves to Product entity or undefined if not found
   */
  async findById(id: ProductId): Promise<Product | undefined> {
    const document = await this.mongoModel.findById(id.getValue()).exec();

    if (!document) {
      return undefined;
    }

    return ProductMongoMapper.toDomain(document);
  }

  /**
   * Finds all products
   * @returns Promise that resolves to array of Product entities
   */
  async findAll(): Promise<Product[]> {
    const documents = await this.mongoModel.find().exec();
    return documents.map((document) => ProductMongoMapper.toDomain(document));
  }

  /**
   * Checks if a product exists by ID
   * @param id - Product identifier
   * @returns Promise that resolves to true if product exists, false otherwise
   */
  async exists(id: ProductId): Promise<boolean> {
    const count = await this.mongoModel.countDocuments({
      _id: id.getValue(),
    });
    return count > 0;
  }

  /**
   * Deletes a product by ID
   * @param id - Product identifier
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: ProductId): Promise<void> {
    await this.mongoModel.findByIdAndDelete(id.getValue()).exec();
  }
}
