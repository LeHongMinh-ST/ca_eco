import { DynamicModule, Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule } from "@nestjs/mongoose";
import { CreateUserHandler } from "./application/commands/create-user/create-user.handler";
import { UpdateUserEmailHandler } from "./application/commands/update-user-email/update-user-email.handler";
import { UpdateUserNameHandler } from "./application/commands/update-user-name/update-user-name.handler";
import { UpdateUserPasswordHandler } from "./application/commands/update-user-password/update-user-password.handler";
import { DeleteUserHandler } from "./application/commands/delete-user/delete-user.handler";
import { GetUserByIdHandler } from "./application/queries/get-user-by-id/get-user-by-id.handler";
import { GetUserByEmailHandler } from "./application/queries/get-user-by-email/get-user-by-email.handler";
import { UserController } from "./presentation/controllers/user.controller";
import { UserOrmEntity } from "./infrastructure/persistence/entities/user.orm-entity";
import { UserRepository } from "./infrastructure/persistence/repositories/user.repository";
import {
  UserMongoEntity,
  UserSchema,
} from "./infrastructure/persistence/entities/user.schema";
import { UserMongoRepository } from "./infrastructure/persistence/repositories/user.mongo-repository";
import { UserRepositoryToken } from "./domain/repositories/user.repository.interface";
import { DatabaseType } from "../../databases/database.factory";
import { OutboxModule } from "../../shared/infrastructure/outbox/outbox.module";

/**
 * UserModule dynamically configures persistence layer based on DB_TYPE
 * Supports both PostgreSQL (TypeORM) and MongoDB (Mongoose)
 * Automatically selects appropriate repository and schema based on environment variable
 */
@Module({})
export class UserModule {
  /**
   * Creates UserModule with appropriate database configuration
   * Dynamically imports the appropriate database module based on DB_TYPE
   * @returns DynamicModule configured for PostgreSQL or MongoDB
   */
  static forRoot(): DynamicModule {
    const dbType = (process.env.DB_TYPE || DatabaseType.POSTGRES).toLowerCase();

    let repositoryClass: typeof UserMongoRepository | typeof UserRepository;
    const imports: any[] = [CqrsModule, OutboxModule.forRoot()];

    switch (dbType) {
      case DatabaseType.MONGODB.toLowerCase():
        imports.push(
          MongooseModule.forFeature([
            { name: UserMongoEntity.name, schema: UserSchema },
          ]),
        );
        repositoryClass = UserMongoRepository;
        break;
      case DatabaseType.POSTGRES.toLowerCase():
      default:
        imports.push(TypeOrmModule.forFeature([UserOrmEntity]));
        repositoryClass = UserRepository;
        break;
    }

    return {
      module: UserModule,
      imports,
      controllers: [UserController],
      providers: [
        // Command handlers
        CreateUserHandler,
        UpdateUserEmailHandler,
        UpdateUserNameHandler,
        UpdateUserPasswordHandler,
        DeleteUserHandler,
        // Query handlers
        GetUserByIdHandler,
        GetUserByEmailHandler,
        // Repository
        {
          provide: UserRepositoryToken,
          useClass: repositoryClass,
        },
      ],
      exports: [UserRepositoryToken],
    };
  }
}
