/**
 * Database configuration for TypeORM
 * Exports TypeORM configuration object
 */

import { join } from "path";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";

/**
 * Get TypeORM configuration from environment variables
 * but we also need to register them here for TypeORM metadata initialization
 */
export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  return {
    type: "postgres",
    host: configService.get<string>("DATABASE_HOST") || "localhost",
    port: configService.get<number>("DATABASE_PORT") || 5432,
    username: configService.get<string>("DATABASE_USER") || "user",
    password: configService.get<string>("DATABASE_PASSWORD") || "password",
    database: configService.get<string>("DATABASE_NAME") || "ca_eco",
    synchronize: configService.get<string>("DATABASE_SYNCHRONIZE") === "true",
    logging: configService.get<string>("DATABASE_LOGGING") === "true",
    entities: [join(__dirname, "../../modules/**/*.orm-entity{.ts,.js}")],
    migrations: [join(__dirname, "../migrations/*{.ts,.js}")],
    migrationsRun: false,
    migrationsTableName: "migrations",
    extra: {
      max: 20, // Maximum number of connections in pool
      connectionTimeoutMillis: 2000,
    },
  };
};
