import { DynamicModule, Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule } from "@nestjs/mongoose";
import { CreateProductHandler } from "./application/commands/create-product/create-product.handler";
import { UpdateProductHandler } from "./application/commands/update-product/update-product.handler";
import { DeleteProductHandler } from "./application/commands/delete-product/delete-product.handler";
import { GetAllProductsHandler } from "./application/queries/get-all-products/get-all-products.handler";
import { GetProductByIdHandler } from "./application/queries/get-product-by-id/get-product-by-id.handler";
import { ProductController } from "./presentation/controllers/product.controller";
import { ProductOrmEntity } from "./infrastructure/persistence/entities/product.orm-entity";
import { ProductRepository } from "./infrastructure/persistence/repositories/product.repository";
import {
  ProductMongoEntity,
  ProductSchema,
} from "./infrastructure/persistence/entities/product.schema";
import { ProductMongoRepository } from "./infrastructure/persistence/repositories/product.mongo-repository";
import { ProductRepositoryToken } from "./domain/repositories/product.repository.interface";
import { DatabaseType } from "../../databases/database.factory";
import { ProductCreatedHandler } from "./application/events/product-created.handler";
import { EventHandlersRegistry } from "../../shared/application/events/event-handlers-registry";
import { OutboxModule } from "../../shared/infrastructure/outbox/outbox.module";

/**
 * ProductModule dynamically configures persistence layer based on DB_TYPE
 * Supports both PostgreSQL (TypeORM) and MongoDB (Mongoose)
 * Automatically selects appropriate repository and schema based on environment variable
 */
@Module({})
export class ProductModule {
  /**
   * Creates ProductModule with appropriate database configuration
   * Dynamically imports the appropriate database module based on DB_TYPE
   * @returns DynamicModule configured for PostgreSQL or MongoDB
   */
  static forRoot(): DynamicModule {
    const dbType = (process.env.DB_TYPE || DatabaseType.POSTGRES).toLowerCase();

    let repositoryClass:
      | typeof ProductMongoRepository
      | typeof ProductRepository;
    const imports: any[] = [CqrsModule, OutboxModule.forRoot()];

    switch (dbType) {
      case DatabaseType.MONGODB.toLowerCase():
        imports.push(
          MongooseModule.forFeature([
            { name: ProductMongoEntity.name, schema: ProductSchema },
          ]),
        );
        repositoryClass = ProductMongoRepository;
        break;
      case DatabaseType.POSTGRES.toLowerCase():
      default:
        imports.push(TypeOrmModule.forFeature([ProductOrmEntity]));
        repositoryClass = ProductRepository;
        break;
    }

    return {
      module: ProductModule,
      imports,
      controllers: [ProductController],
      providers: [
        CreateProductHandler,
        UpdateProductHandler,
        DeleteProductHandler,
        GetProductByIdHandler,
        GetAllProductsHandler,
        {
          provide: ProductRepositoryToken,
          useClass: repositoryClass,
        },
        // Event handlers
        ProductCreatedHandler,
        // Register event handler with registry
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
      ],
      exports: [ProductRepositoryToken],
    };
  }
}
