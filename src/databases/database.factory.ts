/**
 * Database Factory
 * Provides dynamic database module based on DB_TYPE environment variable
 * Demonstrates flexibility of switching databases in DDD architecture
 */

import { DynamicModule, Module } from "@nestjs/common";
import { PostgreSQLModule } from "./pgsql/pgsql.module";
import { MongoDBModule } from "./mongodb/mongodb.module";

/**
 * Database type enum
 */
export enum DatabaseType {
  POSTGRES = "postgres",
  MONGODB = "mongodb",
}

/**
 * Database Factory Module
 * Dynamically imports the appropriate database module based on DB_TYPE
 */
@Module({})
export class DatabaseFactoryModule {
  /**
   * Creates database module dynamically based on environment variable
   * @returns DynamicModule with appropriate database module imported
   */
  static forRoot(): DynamicModule {
    const dbType = (process.env.DB_TYPE || DatabaseType.POSTGRES).toLowerCase();

    let databaseModule: any;

    switch (dbType) {
      case DatabaseType.MONGODB:
        databaseModule = MongoDBModule;
        break;
      case DatabaseType.POSTGRES:
      default:
        databaseModule = PostgreSQLModule;
        break;
    }

    return {
      module: DatabaseFactoryModule,
      imports: [databaseModule],
      exports: [databaseModule],
    };
  }
}
