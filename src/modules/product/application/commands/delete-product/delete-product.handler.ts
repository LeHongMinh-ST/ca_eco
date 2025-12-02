import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NotFoundError } from "src/shared/domain/errors/not-found.error";
import type { IProductRepository } from "src/modules/product/domain/repositories/product.repository.interface";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
import { DeleteProductCommand } from "./delete-product.command";

/**
 * DeleteProductHandler handles the deletion of a product
 */
@CommandHandler(DeleteProductCommand)
export class DeleteProductHandler
  implements ICommandHandler<DeleteProductCommand, void>
{
  constructor(private readonly productRepository: IProductRepository) {}

  /**
   * Executes the delete product command
   * @param command - DeleteProductCommand containing product ID
   * @returns Promise that resolves when deletion is complete
   * @throws NotFoundError if product does not exist
   */
  async execute(command: DeleteProductCommand): Promise<void> {
    const productId = ProductId.create(command.productId);

    // Check if product exists
    const exists = await this.productRepository.exists(productId);
    if (!exists) {
      throw new NotFoundError("Product not found", "productId", productId.getValue());
    }

    // Delete product
    await this.productRepository.delete(productId);
  }
}
