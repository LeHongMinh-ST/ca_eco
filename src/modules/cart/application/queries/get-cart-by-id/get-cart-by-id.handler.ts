import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { NotFoundError } from "src/shared/domain/errors/not-found.error";
import type { ICartRepository } from "src/modules/cart/domain/repositories/cart.repository.interface";
import { CartRepositoryToken } from "src/modules/cart/domain/repositories/cart.repository.interface";
import { CartId } from "src/modules/cart/domain/value-objects/cart-id.vo";
import { GetCartByIdQuery } from "./get-cart-by-id.query";
import { CartDto } from "../dtos/cart.dto";

/**
 * GetCartByIdHandler handles the query to get a cart by ID
 */
@QueryHandler(GetCartByIdQuery)
export class GetCartByIdHandler implements IQueryHandler<
  GetCartByIdQuery,
  CartDto
> {
  constructor(
    @Inject(CartRepositoryToken)
    private readonly cartRepository: ICartRepository,
  ) {}

  /**
   * Executes the get cart by ID query
   * @param query - GetCartByIdQuery containing cart ID
   * @returns Promise that resolves to CartDto
   * @throws NotFoundError if cart does not exist
   */
  async execute(query: GetCartByIdQuery): Promise<CartDto> {
    const cartId = CartId.create(query.cartId);

    const cart = await this.cartRepository.findById(cartId);
    if (!cart) {
      throw new NotFoundError("Cart not found", "cartId", cartId.getValue());
    }

    return CartDto.fromEntity(cart);
  }
}
