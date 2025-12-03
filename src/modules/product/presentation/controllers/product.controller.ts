import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateProductCommand } from "../../application/commands/create-product/create-product.command";
import { CreateProductResult } from "../../application/commands/create-product/create-product.result";
import { UpdateProductCommand } from "../../application/commands/update-product/update-product.command";
import { DeleteProductCommand } from "../../application/commands/delete-product/delete-product.command";
import { GetProductByIdQuery } from "../../application/queries/get-product-by-id/get-product-by-id.query";
import { GetAllProductsQuery } from "../../application/queries/get-all-products/get-all-products.query";
import { ProductDto } from "../../application/queries/dtos/product.dto";
import { CreateProductDto } from "../dtos/create-product.dto";
import { UpdateProductDto } from "../dtos/update-product.dto";

/**
 * ProductController handles HTTP requests for product operations
 */
@Controller("products")
export class ProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Creates a new product
   * POST /products
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<CreateProductResult> {
    const command = new CreateProductCommand(
      createProductDto.name,
      createProductDto.price,
      createProductDto.image,
    );
    return await this.commandBus.execute<
      CreateProductCommand,
      CreateProductResult
    >(command);
  }

  /**
   * Gets all products
   * GET /products
   */
  @Get()
  async findAll(): Promise<ProductDto[]> {
    const query = new GetAllProductsQuery();
    return await this.queryBus.execute<GetAllProductsQuery, ProductDto[]>(
      query,
    );
  }

  /**
   * Gets a product by ID
   * GET /products/:id
   */
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<ProductDto> {
    const query = new GetProductByIdQuery(id);
    return await this.queryBus.execute<GetProductByIdQuery, ProductDto>(query);
  }

  /**
   * Updates a product
   * PUT /products/:id
   */
  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<void> {
    const command = new UpdateProductCommand(
      id,
      updateProductDto.name,
      updateProductDto.price,
      updateProductDto.image,
    );
    await this.commandBus.execute<UpdateProductCommand, void>(command);
  }

  /**
   * Deletes a product
   * DELETE /products/:id
   */
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string): Promise<void> {
    const command = new DeleteProductCommand(id);
    await this.commandBus.execute<DeleteProductCommand, void>(command);
  }
}
