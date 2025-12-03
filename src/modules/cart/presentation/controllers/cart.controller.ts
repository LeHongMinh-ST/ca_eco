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
@Controller("carts")
export class CartController {
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
  async create(@Body() createCartDto: CreateCartDto): Promise<CreateCartResult> {
    const command = new CreateCartCommand(createCartDto.userId);
    return await this.commandBus.execute<CreateCartCommand, CreateCartResult>(
      command,
    );
  }

  /**
   * Gets a cart by ID
   * GET /carts/:id
   */
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<CartDto> {
    const query = new GetCartByIdQuery(id);
    return await this.queryBus.execute<GetCartByIdQuery, CartDto>(query);
  }

  /**
   * Gets a cart by user ID
   * GET /carts/user/:userId
   */
  @Get("user/:userId")
  async findByUserId(@Param("userId") userId: string): Promise<CartDto> {
    const query = new GetCartByUserIdQuery(userId);
    return await this.queryBus.execute<GetCartByUserIdQuery, CartDto>(query);
  }

  /**
   * Adds an item to cart
   * POST /carts/:cartId/items
   */
  @Post(":cartId/items")
  @HttpCode(HttpStatus.CREATED)
  async addItem(
    @Param("cartId") cartId: string,
    @Body() addItemDto: AddItemToCartDto,
  ): Promise<void> {
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
  async removeItem(
    @Param("cartId") cartId: string,
    @Param("itemId") itemId: string,
  ): Promise<void> {
    const command = new RemoveItemFromCartCommand(cartId, itemId);
    await this.commandBus.execute<RemoveItemFromCartCommand, void>(command);
  }

  /**
   * Clears all items from cart
   * DELETE /carts/:cartId
   */
  @Delete(":cartId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async clear(@Param("cartId") cartId: string): Promise<void> {
    const command = new ClearCartCommand(cartId);
    await this.commandBus.execute<ClearCartCommand, void>(command);
  }
}

