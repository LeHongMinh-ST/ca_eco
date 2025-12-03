import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import type { IProductRepository } from "src/modules/product/domain/repositories/product.repository.interface";
import { ProductRepositoryToken } from "src/modules/product/domain/repositories/product.repository.interface";
import { Product } from "src/modules/product/domain/entities/product.entity";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
import { ProductName } from "src/modules/product/domain/value-objects/product-name.vo";
import { ProductPrice } from "src/modules/product/domain/value-objects/product-price.vo";
import { ProductImage } from "src/modules/product/domain/value-objects/product-image.vo";
import { CreateProductCommand } from "./create-product.command";
import { CreateProductResult } from "./create-product.result";

/**
 * CreateProductHandler handles the creation of a new product
 */
@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<
  CreateProductCommand,
  CreateProductResult
> {
  constructor(
    @Inject(ProductRepositoryToken)
    private readonly productRepository: IProductRepository,
  ) {}

  /**
   * Executes the create product command
   * @param command - CreateProductCommand containing product data
   * @returns Promise that resolves to CreateProductResult with created product ID
   */
  async execute(command: CreateProductCommand): Promise<CreateProductResult> {
    // Generate new product ID
    const productId = ProductId.create(crypto.randomUUID());

    // Create value objects
    const name = ProductName.create(command.name);
    const price = ProductPrice.create(command.price);
    const image = ProductImage.create(command.image);

    // Create product entity
    const product = Product.create(productId, name, price, image);

    // Save product
    await this.productRepository.save(product);

    return new CreateProductResult(productId.getValue());
  }
}
