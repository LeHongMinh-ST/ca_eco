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
import { CreateCartCommand } from "../../application/commands/create-cart/create-cart.command";
import { CreateCartResult } from "../../application/commands/create-cart/create-cart.result";
import { AddItemToCartCommand } from "../../application/commands/add-item-to-cart/add-item-to-cart.command";
import { UpdateItemQuantityCommand } from "../../application/commands/update-item-quantity/update-item-quantity.command";
import { RemoveItemFromCartCommand } from "../../application/commands/remove-item-from-cart/remove-item-from-cart.command";
import { ClearCartCommand } from "../../application/commands/clear-cart/clear-cart.command";
import { GetCartByIdQuery } from "../../application/queries/get-cart-by-id/get-cart-by-id.query";
import { GetCartByUserIdQuery } from "../../application/queries/get-cart-by-user-id/get-cart-by-user-id.query";
import { CartDto } from "../../application/queries/dtos/cart.dto";
import { CreateCartDto } from "../dtos/create-cart.dto";
import { AddItemToCartDto } from "../dtos/add-item-to-cart.dto";
import { UpdateItemQuantityDto } from "../dtos/update-item-quantity.dto";

/**
 * CartController handles HTTP requests for cart operations
 */
@ApiTags("carts")
@Controller("carts")
export class CartController {
  private readonly logger = new Logger(CartController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Creates a new cart
   * POST /carts
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new cart for a user" })
  @ApiBody({ type: CreateCartDto })
  @ApiResponse({
    status: 201,
    description: "Cart created successfully",
    schema: {
      example: {
        cartId: "443e4567-e89b-12d3-a456-426614174003",
      },
    },
  })
  @ApiResponse({ status: 400, description: "Bad request - validation failed" })
  async create(
    @Body() createCartDto: CreateCartDto,
  ): Promise<CreateCartResult> {
    this.logger.log("Creating cart with DTO:", JSON.stringify(createCartDto));
    const command = new CreateCartCommand(createCartDto.userId);
    const result = await this.commandBus.execute<
      CreateCartCommand,
      CreateCartResult
    >(command);
    this.logger.log("Cart created successfully:", result.cartId);
    return result;
  }

  /**
   * Gets a cart by ID
   * GET /carts/:id
   */
  @Get(":id")
  @ApiOperation({ summary: "Get a cart by ID" })
  @ApiParam({
    name: "id",
    description: "Cart ID (UUID)",
    example: "443e4567-e89b-12d3-a456-426614174003",
  })
  @ApiResponse({
    status: 200,
    description: "Cart found",
    type: CartDto,
  })
  @ApiResponse({ status: 404, description: "Cart not found" })
  async findOne(@Param("id") id: string): Promise<CartDto> {
    const query = new GetCartByIdQuery(id);
    return await this.queryBus.execute<GetCartByIdQuery, CartDto>(query);
  }

  /**
   * Gets a cart by user ID
   * GET /carts/user/:userId
   */
  @Get("user/:userId")
  @ApiOperation({ summary: "Get a cart by user ID" })
  @ApiParam({
    name: "userId",
    description: "User ID (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Cart found",
    type: CartDto,
  })
  @ApiResponse({ status: 404, description: "Cart not found" })
  async findByUserId(@Param("userId") userId: string): Promise<CartDto> {
    const query = new GetCartByUserIdQuery(userId);
    return await this.queryBus.execute<GetCartByUserIdQuery, CartDto>(query);
  }

  /**
   * Adds an item to cart
   * POST /carts/:cartId/items
   */
  @Post(":cartId/items")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Add an item to cart" })
  @ApiParam({
    name: "cartId",
    description: "Cart ID (UUID)",
    example: "443e4567-e89b-12d3-a456-426614174003",
  })
  @ApiBody({ type: AddItemToCartDto })
  @ApiResponse({ status: 200, description: "Item added to cart successfully" })
  @ApiResponse({ status: 404, description: "Cart or Product not found" })
  @ApiResponse({ status: 400, description: "Bad request - validation failed" })
  async addItem(
    @Param("cartId") cartId: string,
    @Body() addItemDto: AddItemToCartDto,
  ): Promise<void> {
    this.logger.log(
      `Adding item to cart ${cartId}:`,
      JSON.stringify(addItemDto),
    );
    const command = new AddItemToCartCommand(
      cartId,
      addItemDto.productId,
      addItemDto.quantity,
    );
    await this.commandBus.execute<AddItemToCartCommand, void>(command);
  }

  /**
   * Updates cart item quantity
   * PUT /carts/:cartId/items/:itemId
   */
  @Put(":cartId/items/:itemId")
  @ApiOperation({ summary: "Update cart item quantity" })
  @ApiParam({
    name: "cartId",
    description: "Cart ID (UUID)",
    example: "443e4567-e89b-12d3-a456-426614174003",
  })
  @ApiParam({
    name: "itemId",
    description: "Cart item ID (UUID)",
    example: "333e4567-e89b-12d3-a456-426614174002",
  })
  @ApiBody({ type: UpdateItemQuantityDto })
  @ApiResponse({
    status: 200,
    description: "Item quantity updated successfully",
  })
  @ApiResponse({ status: 404, description: "Cart or Item not found" })
  @ApiResponse({ status: 400, description: "Bad request - validation failed" })
  async updateItemQuantity(
    @Param("cartId") cartId: string,
    @Param("itemId") itemId: string,
    @Body() updateQuantityDto: UpdateItemQuantityDto,
  ): Promise<void> {
    const command = new UpdateItemQuantityCommand(
      cartId,
      itemId,
      updateQuantityDto.quantity,
    );
    await this.commandBus.execute<UpdateItemQuantityCommand, void>(command);
  }

  /**
   * Removes an item from cart
   * DELETE /carts/:cartId/items/:itemId
   */
  @Delete(":cartId/items/:itemId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove an item from cart" })
  @ApiParam({
    name: "cartId",
    description: "Cart ID (UUID)",
    example: "443e4567-e89b-12d3-a456-426614174003",
  })
  @ApiParam({
    name: "itemId",
    description: "Cart item ID (UUID)",
    example: "333e4567-e89b-12d3-a456-426614174002",
  })
  @ApiResponse({ status: 204, description: "Item removed successfully" })
  @ApiResponse({ status: 404, description: "Cart or Item not found" })
  async removeItem(
    @Param("cartId") cartId: string,
    @Param("itemId") itemId: string,
  ): Promise<void> {
    const command = new RemoveItemFromCartCommand(cartId, itemId);
    await this.commandBus.execute<RemoveItemFromCartCommand, void>(command);
  }

  /**
   * Clears all items from cart
   * DELETE /carts/:cartId/clear
   */
  @Delete(":cartId/clear")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Clear all items from cart" })
  @ApiParam({
    name: "cartId",
    description: "Cart ID (UUID)",
    example: "443e4567-e89b-12d3-a456-426614174003",
  })
  @ApiResponse({ status: 204, description: "Cart cleared successfully" })
  @ApiResponse({ status: 404, description: "Cart not found" })
  async clear(@Param("cartId") cartId: string): Promise<void> {
    const command = new ClearCartCommand(cartId);
    await this.commandBus.execute<ClearCartCommand, void>(command);
  }
}
