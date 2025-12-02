import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { NotFoundError } from "src/shared/domain/errors/not-found.error";
import type { IProductRepository } from "src/modules/product/domain/repositories/product.repository.interface";
import { ProductRepositoryToken } from "src/modules/product/domain/repositories/product.repository.interface";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
import { GetProductByIdQuery } from "./get-product-by-id.query";
import { ProductDto } from "../dtos/product.dto";

/**
 * GetProductByIdHandler handles the query to get a product by ID
 */
@QueryHandler(GetProductByIdQuery)
export class GetProductByIdHandler
  implements IQueryHandler<GetProductByIdQuery, ProductDto>
{
  constructor(
    @Inject(ProductRepositoryToken)
    private readonly productRepository: IProductRepository,
  ) {}

  /**
   * Executes the get product by ID query
   * @param query - GetProductByIdQuery containing product ID
   * @returns Promise that resolves to ProductDto
   * @throws NotFoundError if product does not exist
   */
  async execute(query: GetProductByIdQuery): Promise<ProductDto> {
    const productId = ProductId.create(query.productId);

    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found", "productId", productId.getValue());
    }

    return ProductDto.fromEntity(product);
  }
}
