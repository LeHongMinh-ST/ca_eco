import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./modules/user/user.module";
import { OrderModule } from "./modules/order/order.module";
import { ProductModule } from "./modules/product/product.module";
import { CartModule } from "./modules/cart/cart.module";
import { PostgreSQLModule } from "./databases/pgsql/pgsql.module";

@Module({
  imports: [
    //Infrastructure modules
    PostgreSQLModule,

    //Domain modules
    UserModule,
    OrderModule,
    ProductModule,
    CartModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
