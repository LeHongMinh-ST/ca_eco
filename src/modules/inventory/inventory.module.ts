import { DynamicModule, Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule } from "@nestjs/mongoose";
import { OutboxModule } from "../../shared/infrastructure/outbox/outbox.module";
import { OrderCreatedHandler } from "./application/events/order-created.handler";
import { ProductCreatedHandler } from "./application/events/product-created.handler";
import { EventHandlersRegistry } from "../../shared/application/events/event-handlers-registry";
import { InventoryOrmEntity } from "./infrastructure/persistence/entities/inventory.orm-entity";
import { InventoryRepository } from "./infrastructure/persistence/repositories/inventory.repository";
import {
  InventoryMongoEntity,
  InventorySchema,
} from "./infrastructure/persistence/entities/inventory.schema";
import { InventoryMongoRepository } from "./infrastructure/persistence/repositories/inventory.mongo-repository";
import { InventoryRepositoryToken } from "./domain/repositories/inventory.repository.interface";
import { DatabaseType } from "../../databases/database.factory";

/**
 * InventoryModule configures inventory management
 * Listens to ProductCreated events to auto-create inventory
 * Listens to OrderCreated events to check and decrease inventory
 * Supports both PostgreSQL (TypeORM) and MongoDB (Mongoose)
 */
@Module({})
export class InventoryModule {
  /**
   * Creates InventoryModule with event handlers and repository
   * @returns DynamicModule configured for inventory management
   */
  static forRoot(): DynamicModule {
    const dbType = (process.env.DB_TYPE || DatabaseType.POSTGRES).toLowerCase();

    let repositoryClass:
      | typeof InventoryMongoRepository
      | typeof InventoryRepository;
    const imports: any[] = [CqrsModule, OutboxModule.forRoot()];

    switch (dbType) {
      case DatabaseType.MONGODB.toLowerCase():
        imports.push(
          MongooseModule.forFeature([
            { name: InventoryMongoEntity.name, schema: InventorySchema },
          ]),
        );
        repositoryClass = InventoryMongoRepository;
        break;
      case DatabaseType.POSTGRES.toLowerCase():
      default:
        imports.push(TypeOrmModule.forFeature([InventoryOrmEntity]));
        repositoryClass = InventoryRepository;
        break;
    }

    return {
      module: InventoryModule,
      imports,
      providers: [
        // Repository
        {
          provide: InventoryRepositoryToken,
          useClass: repositoryClass,
        },
        // Event handlers
        ProductCreatedHandler,
        OrderCreatedHandler,
        // Register event handlers with registry
        {
          provide: "REGISTER_PRODUCT_CREATED_HANDLER",
          useFactory: (
            handler: ProductCreatedHandler,
            registry: EventHandlersRegistry,
          ) => {
            registry.register("ProductCreated", handler);
            return handler;
          },
          inject: [ProductCreatedHandler, EventHandlersRegistry],
        },
        {
          provide: "REGISTER_ORDER_CREATED_HANDLER",
          useFactory: (
            handler: OrderCreatedHandler,
            registry: EventHandlersRegistry,
          ) => {
            registry.register("OrderCreated", handler);
            return handler;
          },
          inject: [OrderCreatedHandler, EventHandlersRegistry],
        },
      ],
      exports: [InventoryRepositoryToken],
    };
  }
}
