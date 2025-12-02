import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import type { IProductRepository } from "src/modules/product/domain/repositories/product.repository.interface";
import { GetAllProductsQuery } from "./get-all-products.query";
import { ProductDto } from "../dtos/product.dto";

/**
 * GetAllProductsHandler handles the query to get all products
 */
@QueryHandler(GetAllProductsQuery)
export class GetAllProductsHandler
  implements IQueryHandler<GetAllProductsQuery, ProductDto[]>
{
  constructor(private readonly productRepository: IProductRepository) {}

  /**
   * Executes the get all products query
   * @param query - GetAllProductsQuery
   * @returns Promise that resolves to array of ProductDto
   */
  async execute(query: GetAllProductsQuery): Promise<ProductDto[]> {
    const products = await this.productRepository.findAll();
    return products.map((product) => ProductDto.fromEntity(product));
  }
}
