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
  Logger,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
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
@ApiTags("products")
@Controller("products")
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

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
  @ApiOperation({ summary: "Create a new product" })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: "Product created successfully",
    schema: {
      example: {
        productId: "123e4567-e89b-12d3-a456-426614174000",
      },
    },
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<CreateProductResult> {
    this.logger.log(
      "Creating product with DTO:",
      JSON.stringify(createProductDto),
    );

    const command = new CreateProductCommand(
      createProductDto.name,
      createProductDto.price,
      createProductDto.image,
    );

    const result = await this.commandBus.execute<
      CreateProductCommand,
      CreateProductResult
    >(command);

    this.logger.log("Product created successfully:", result.productId);
    return result;
  }

  /**
   * Gets all products
   * GET /products
   */
  @Get()
  @ApiOperation({ summary: "Get all products" })
  @ApiResponse({
    status: 200,
    description: "List of products",
    type: [ProductDto],
  })
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
  @ApiOperation({ summary: "Get a product by ID" })
  @ApiParam({
    name: "id",
    description: "Product ID (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Product found",
    type: ProductDto,
  })
  @ApiResponse({ status: 404, description: "Product not found" })
  async findOne(@Param("id") id: string): Promise<ProductDto> {
    const query = new GetProductByIdQuery(id);
    return await this.queryBus.execute<GetProductByIdQuery, ProductDto>(query);
  }

  /**
   * Updates a product
   * PUT /products/:id
   */
  @Put(":id")
  @ApiOperation({ summary: "Update a product" })
  @ApiParam({
    name: "id",
    description: "Product ID (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: "Product updated successfully" })
  @ApiResponse({ status: 404, description: "Product not found" })
  @ApiResponse({ status: 400, description: "Bad request" })
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
  @ApiOperation({ summary: "Delete a product" })
  @ApiParam({
    name: "id",
    description: "Product ID (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({ status: 204, description: "Product deleted successfully" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async remove(@Param("id") id: string): Promise<void> {
    const command = new DeleteProductCommand(id);
    await this.commandBus.execute<DeleteProductCommand, void>(command);
  }
}
