import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IProductRepository } from "src/modules/product/domain/repositories/product.repository.interface";
import { Product } from "src/modules/product/domain/entities/product.entity";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
import { ProductMapper } from "../mappers/product.mapper";
import { ProductOrmEntity } from "../entities/product.orm-entity";

/**
 * ProductRepository implements IProductRepository using TypeORM
 * Handles persistence of Product aggregate root
 */
@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly ormRepository: Repository<ProductOrmEntity>,
  ) {}

  /**
   * Saves a product entity
   * Creates new product if not exists, updates if exists
   * @param product - Product entity to save
   * @returns Promise that resolves when save is complete
   */
  async save(product: Product): Promise<void> {
    const ormEntity = ProductMapper.toPersistence(product);
    await this.ormRepository.save(ormEntity);
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
}
