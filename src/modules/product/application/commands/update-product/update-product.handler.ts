import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NotFoundError } from "src/shared/domain/errors/not-found.error";
import type { IProductRepository } from "src/modules/product/domain/repositories/product.repository.interface";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
import { ProductName } from "src/modules/product/domain/value-objects/product-name.vo";
import { ProductPrice } from "src/modules/product/domain/value-objects/product-price.vo";
import { ProductImage } from "src/modules/product/domain/value-objects/product-image.vo";
import { UpdateProductCommand } from "./update-product.command";

/**
 * UpdateProductHandler handles the update of an existing product
 */
@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler
  implements ICommandHandler<UpdateProductCommand, void>
{
  constructor(private readonly productRepository: IProductRepository) {}

  /**
   * Executes the update product command
   * @param command - UpdateProductCommand containing product ID and fields to update
   * @returns Promise that resolves when update is complete
   * @throws NotFoundError if product does not exist
   */
  async execute(command: UpdateProductCommand): Promise<void> {
    const productId = ProductId.create(command.productId);

    // Find existing product
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found", "productId", productId.getValue());
    }

    // Update fields if provided
    if (command.name !== undefined) {
      const name = ProductName.create(command.name);
      product.updateName(name);
    }

    if (command.price !== undefined) {
      const price = ProductPrice.create(command.price);
      product.updatePrice(price);
    }

    if (command.image !== undefined) {
      const image = ProductImage.create(command.image);
      product.updateImage(image);
    }

    // Save updated product
    await this.productRepository.save(product);
  }
}
