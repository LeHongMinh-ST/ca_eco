import { DynamicModule, Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule } from "@nestjs/mongoose";
import { CartModule } from "../cart/cart.module";
import { InventoryModule } from "../inventory/inventory.module";
import { CreateOrderHandler } from "./application/commands/create-order/create-order.handler";
import { CancelOrderHandler } from "./application/commands/cancel-order/cancel-order.handler";
import { UpdateOrderStatusHandler } from "./application/commands/update-order-status/update-order-status.handler";
import { GetOrderByIdHandler } from "./application/queries/get-order-by-id/get-order-by-id.handler";
import { GetOrdersByUserIdHandler } from "./application/queries/get-orders-by-user-id/get-orders-by-user-id.handler";
import { OrderController } from "./presentation/controllers/order.controller";
import { OrderOrmEntity } from "./infrastructure/persistence/entities/order.orm-entity";
import { OrderRepository } from "./infrastructure/persistence/repositories/order.repository";
import {
  OrderMongoEntity,
  OrderSchema,
} from "./infrastructure/persistence/entities/order.schema";
import { OrderMongoRepository } from "./infrastructure/persistence/repositories/order.mongo-repository";
import { OrderRepositoryToken } from "./domain/repositories/order.repository.interface";
import { InventoryServiceAdapter } from "./infrastructure/adapters/inventory-service.adapter";
import { InventoryServicePortToken } from "./domain/services/inventory-service.port";
import { CartServiceAdapter } from "./infrastructure/adapters/cart-service.adapter";
import { CartServicePortToken } from "./domain/services/cart-service.port";
import { DatabaseType } from "../../databases/database.factory";
import { OutboxModule } from "../../shared/infrastructure/outbox/outbox.module";
import { OrderConfirmedHandler } from "./application/events/order-confirmed.handler";
import { OrderFailedHandler } from "./application/events/order-failed.handler";
import { EventHandlersRegistry } from "../../shared/application/events/event-handlers-registry";

/**
 * OrderModule dynamically configures persistence layer based on DB_TYPE
 * Supports both PostgreSQL (TypeORM) and MongoDB (Mongoose)
 * Automatically selects appropriate repository and schema based on environment variable
 * Uses Ports and Adapters pattern to integrate with Cart and Inventory modules
 */
@Module({})
export class OrderModule {
  /**
   * Creates OrderModule with appropriate database configuration
   * Dynamically imports the appropriate database module based on DB_TYPE
   * @returns DynamicModule configured for PostgreSQL or MongoDB
   */
  static forRoot(): DynamicModule {
    const dbType = (process.env.DB_TYPE || DatabaseType.POSTGRES).toLowerCase();

    let repositoryClass: typeof OrderMongoRepository | typeof OrderRepository;
    const imports: any[] = [
      CqrsModule,
      OutboxModule.forRoot(),
      CartModule.forRoot(),
      InventoryModule.forRoot(),
    ];

    switch (dbType) {
      case DatabaseType.MONGODB.toLowerCase():
        imports.push(
          MongooseModule.forFeature([
            { name: OrderMongoEntity.name, schema: OrderSchema },
          ]),
        );
        repositoryClass = OrderMongoRepository;
        break;
      case DatabaseType.POSTGRES.toLowerCase():
      default:
        imports.push(TypeOrmModule.forFeature([OrderOrmEntity]));
        repositoryClass = OrderRepository;
        break;
    }

    return {
      module: OrderModule,
      imports,
      controllers: [OrderController],
      providers: [
        // Command handlers
        CreateOrderHandler,
        CancelOrderHandler,
        UpdateOrderStatusHandler,
        // Query handlers
        GetOrderByIdHandler,
        GetOrdersByUserIdHandler,
        // Repository
        {
          provide: OrderRepositoryToken,
          useClass: repositoryClass,
        },
        // Adapters (Ports and Adapters pattern)
        {
          provide: InventoryServicePortToken,
          useClass: InventoryServiceAdapter,
        },
        {
          provide: CartServicePortToken,
          useClass: CartServiceAdapter,
        },
        // Event handlers
        OrderConfirmedHandler,
        OrderFailedHandler,
        // Register event handlers with registry
        {
          provide: "REGISTER_ORDER_CONFIRMED_HANDLER",
          useFactory: (
            handler: OrderConfirmedHandler,
            registry: EventHandlersRegistry,
          ) => {
            registry.register("OrderConfirmed", handler);
            return handler;
          },
          inject: [OrderConfirmedHandler, EventHandlersRegistry],
        },
        {
          provide: "REGISTER_ORDER_FAILED_HANDLER",
          useFactory: (
            handler: OrderFailedHandler,
            registry: EventHandlersRegistry,
          ) => {
            registry.register("OrderFailed", handler);
            return handler;
          },
          inject: [OrderFailedHandler, EventHandlersRegistry],
        },
      ],
      exports: [OrderRepositoryToken],
    };
  }
}
