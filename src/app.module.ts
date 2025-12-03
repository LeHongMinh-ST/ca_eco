import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./modules/user/user.module";
import { OrderModule } from "./modules/order/order.module";
import { ProductModule } from "./modules/product/product.module";
import { CartModule } from "./modules/cart/cart.module";
import { DatabaseFactoryModule } from "./databases/database.factory";
import { OutboxModule } from "./shared/infrastructure/outbox/outbox.module";

@Module({
  imports: [
    // Infrastructure modules
    // ConfigModule loads environment variables from .env file
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
    }),
    // DatabaseFactoryModule dynamically loads PostgreSQL or MongoDB based on DB_TYPE env variable
    DatabaseFactoryModule.forRoot(),

    // Outbox module for domain event processing
    OutboxModule.forRoot(),

    // Domain modules
    UserModule.forRoot(),
    OrderModule,
    ProductModule.forRoot(),
    CartModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
