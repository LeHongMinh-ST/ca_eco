import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { CreateProductHandler } from "./application/commands/create-product/create-product.handler";
import { UpdateProductHandler } from "./application/commands/update-product/update-product.handler";
import { DeleteProductHandler } from "./application/commands/delete-product/delete-product.handler";
import { GetProductByIdHandler } from "./application/queries/get-product-by-id/get-product-by-id.handler";
import { GetAllProductsHandler } from "./application/queries/get-all-products/get-all-products.handler";

@Module({
  imports: [CqrsModule],
  providers: [
    CreateProductHandler,
    UpdateProductHandler,
    DeleteProductHandler,
    GetProductByIdHandler,
    GetAllProductsHandler,
  ],
})
export class ProductModule {}
