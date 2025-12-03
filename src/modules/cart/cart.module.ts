import { DynamicModule, Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule } from "@nestjs/mongoose";
import { ProductModule } from "../product/product.module";
import { UserModule } from "../user/user.module";
import { CreateCartHandler } from "./application/commands/create-cart/create-cart.handler";
import { AddItemToCartHandler } from "./application/commands/add-item-to-cart/add-item-to-cart.handler";
import { UpdateItemQuantityHandler } from "./application/commands/update-item-quantity/update-item-quantity.handler";
import { RemoveItemFromCartHandler } from "./application/commands/remove-item-from-cart/remove-item-from-cart.handler";
import { ClearCartHandler } from "./application/commands/clear-cart/clear-cart.handler";
import { GetCartByIdHandler } from "./application/queries/get-cart-by-id/get-cart-by-id.handler";
import { GetCartByUserIdHandler } from "./application/queries/get-cart-by-user-id/get-cart-by-user-id.handler";
import { CartController } from "./presentation/controllers/cart.controller";
import { CartOrmEntity } from "./infrastructure/persistence/entities/cart.orm-entity";
import { CartRepository } from "./infrastructure/persistence/repositories/cart.repository";
import {
  CartMongoEntity,
  CartSchema,
} from "./infrastructure/persistence/entities/cart.schema";
import { CartMongoRepository } from "./infrastructure/persistence/repositories/cart.mongo-repository";
import { CartRepositoryToken } from "./domain/repositories/cart.repository.interface";
import { ProductServiceAdapter } from "./infrastructure/adapters/product-service.adapter";
import { ProductServicePortToken } from "./domain/services/product-service.port";
import { UserServiceAdapter } from "./infrastructure/adapters/user-service.adapter";
import { UserServicePortToken } from "./domain/services/user-service.port";
import { DatabaseType } from "../../databases/database.factory";
import { OutboxModule } from "../../shared/infrastructure/outbox/outbox.module";
import { UserCreatedHandler } from "./application/events/user-created.handler";
import { CartClearOnOrderConfirmedHandler } from "./application/events/order-confirmed.handler";
import { EventHandlersRegistry } from "../../shared/application/events/event-handlers-registry";

/**
 * CartModule dynamically configures persistence layer based on DB_TYPE
 * Supports both PostgreSQL (TypeORM) and MongoDB (Mongoose)
 * Automatically selects appropriate repository and schema based on environment variable
 * Uses Ports and Adapters pattern to integrate with Product and User modules
 */
@Module({})
export class CartModule {
  /**
   * Creates CartModule with appropriate database configuration
   * Dynamically imports the appropriate database module based on DB_TYPE
   * @returns DynamicModule configured for PostgreSQL or MongoDB
   */
  static forRoot(): DynamicModule {
    const dbType = (process.env.DB_TYPE || DatabaseType.POSTGRES).toLowerCase();

    let repositoryClass: typeof CartMongoRepository | typeof CartRepository;
    const imports: any[] = [
      CqrsModule,
      OutboxModule.forRoot(),
      ProductModule.forRoot(),
      UserModule.forRoot(),
    ];

    switch (dbType) {
      case DatabaseType.MONGODB.toLowerCase():
        imports.push(
          MongooseModule.forFeature([
            { name: CartMongoEntity.name, schema: CartSchema },
          ]),
        );
        repositoryClass = CartMongoRepository;
        break;
      case DatabaseType.POSTGRES.toLowerCase():
      default:
        imports.push(TypeOrmModule.forFeature([CartOrmEntity]));
        repositoryClass = CartRepository;
        break;
    }

    return {
      module: CartModule,
      imports,
      controllers: [CartController],
      providers: [
        // Command handlers
        CreateCartHandler,
        AddItemToCartHandler,
        UpdateItemQuantityHandler,
        RemoveItemFromCartHandler,
        ClearCartHandler,
        // Query handlers
        GetCartByIdHandler,
        GetCartByUserIdHandler,
        // Repository
        {
          provide: CartRepositoryToken,
          useClass: repositoryClass,
        },
        // Adapters (Ports and Adapters pattern)
        {
          provide: ProductServicePortToken,
          useClass: ProductServiceAdapter,
        },
        {
          provide: UserServicePortToken,
          useClass: UserServiceAdapter,
        },
        // Event handlers
        UserCreatedHandler,
        CartClearOnOrderConfirmedHandler,
        // Register event handlers with registry
        {
          provide: "REGISTER_USER_CREATED_HANDLER",
          useFactory: (
            handler: UserCreatedHandler,
            registry: EventHandlersRegistry,
          ) => {
            registry.register("UserCreated", handler);
            return handler;
          },
          inject: [UserCreatedHandler, EventHandlersRegistry],
        },
        {
          provide: "REGISTER_CART_CLEAR_ON_ORDER_CONFIRMED_HANDLER",
          useFactory: (
            handler: CartClearOnOrderConfirmedHandler,
            registry: EventHandlersRegistry,
          ) => {
            registry.register("OrderConfirmed", handler);
            return handler;
          },
          inject: [CartClearOnOrderConfirmedHandler, EventHandlersRegistry],
        },
      ],
      exports: [CartRepositoryToken],
    };
  }
}
