// comment: NestJS imports
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // comment: global prefix
  app.setGlobalPrefix("api");

  // comment: Swagger config
  const swaggerConfig = new DocumentBuilder()
    .setTitle(process.env.APP_NAME || "NestJS API")
    .setDescription("Stayly Bookings API Documentation")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",

        description: "Enter JWT token",
        in: "header",
      },

      "JWT-auth",
    )
    .addTag("health")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
