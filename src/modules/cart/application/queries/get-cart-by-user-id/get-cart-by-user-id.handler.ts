import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { NotFoundError } from "src/shared/domain/errors/not-found.error";
import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";
import type { ICartRepository } from "src/modules/cart/domain/repositories/cart.repository.interface";
import { CartRepositoryToken } from "src/modules/cart/domain/repositories/cart.repository.interface";
import type { IUserServicePort } from "src/modules/cart/domain/services/user-service.port";
import { UserServicePortToken } from "src/modules/cart/domain/services/user-service.port";
import { UserId } from "src/modules/cart/domain/value-objects/user-id.vo";
import { GetCartByUserIdQuery } from "./get-cart-by-user-id.query";
import { CartDto } from "../dtos/cart.dto";

/**
 * GetCartByUserIdHandler handles the query to get a cart by user ID
 */
@QueryHandler(GetCartByUserIdQuery)
export class GetCartByUserIdHandler implements IQueryHandler<
  GetCartByUserIdQuery,
  CartDto
> {
  constructor(
    @Inject(CartRepositoryToken)
    private readonly cartRepository: ICartRepository,
    @Inject(UserServicePortToken)
    private readonly userService: IUserServicePort,
  ) {}

  /**
   * Executes the get cart by user ID query
   * @param query - GetCartByUserIdQuery containing user ID
   * @returns Promise that resolves to CartDto
   * @throws NotFoundError if cart does not exist
   * @throws InvalidInputError if user does not exist
   */
  async execute(query: GetCartByUserIdQuery): Promise<CartDto> {
    // Validate user exists through port
    const userExists = await this.userService.userExists(query.userId);
    if (!userExists) {
      throw new InvalidInputError(
        "User not found",
        "userId",
        query.userId,
      );
    }

    const userId = UserId.create(query.userId);

    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundError("Cart not found", "userId", userId.getValue());
    }

    return CartDto.fromEntity(cart);
  }
}
