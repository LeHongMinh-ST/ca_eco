import { Injectable, Inject } from "@nestjs/common";
import {
  IProductServicePort,
  ProductInfo,
} from "../../domain/services/product-service.port";
import type { IProductRepository } from "src/modules/product/domain/repositories/product.repository.interface";
import { ProductRepositoryToken } from "src/modules/product/domain/repositories/product.repository.interface";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";

/**
 * ProductServiceAdapter implements IProductServicePort
 * This is an adapter in Hexagonal Architecture pattern
 * Adapts ProductRepository from Product module to Cart module's port interface
 */
@Injectable()
export class ProductServiceAdapter implements IProductServicePort {
  constructor(
    @Inject(ProductRepositoryToken)
    private readonly productRepository: IProductRepository,
  ) {}

  /**
   * Gets product information by product ID
   * @param productId - Product identifier
   * @returns Promise that resolves to ProductInfo or undefined if not found
   */
  async getProductInfo(productId: string): Promise<ProductInfo | undefined> {
    const id = ProductId.create(productId);
    const product = await this.productRepository.findById(id);

    if (!product) {
      return undefined;
    }

    return {
      id: product.getId().getValue(),
      name: product.getName().getValue(),
      price: product.getPrice().getValue(),
      image: product.getImage().getValue(),
    };
  }
}
