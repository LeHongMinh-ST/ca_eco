import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CreateProductHandler } from "./application/commands/create-product/create-product.handler";
import { UpdateProductHandler } from "./application/commands/update-product/update-product.handler";
import { DeleteProductHandler } from "./application/commands/delete-product/delete-product.handler";
import { GetAllProductsHandler } from "./application/queries/get-all-products/get-all-products.handler";
import { GetProductByIdHandler } from "./application/queries/get-product-by-id/get-product-by-id.handler";
import { ProductController } from "./presentation/controllers/product.controller";
import { ProductOrmEntity } from "./infrastructure/persistence/entities/product.orm-entity";
import { ProductRepository } from "./infrastructure/persistence/repositories/product.repository";
import { ProductRepositoryToken } from "./domain/repositories/product.repository.interface";

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([ProductOrmEntity]),
  ],
  controllers: [ProductController],
  providers: [
    CreateProductHandler,
    UpdateProductHandler,
    DeleteProductHandler,
    GetProductByIdHandler,
    GetAllProductsHandler,
    {
      provide: ProductRepositoryToken,
      useClass: ProductRepository,
    },
  ],
  exports: [ProductRepositoryToken],
})
export class ProductModule {}
