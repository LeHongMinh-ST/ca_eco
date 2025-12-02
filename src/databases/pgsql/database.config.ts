/**
 * Database configuration for TypeORM
 * Exports TypeORM configuration object
 */

import { join } from "path";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

/**
 * Get TypeORM configuration from environment variables
 */
export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  return {
    type: "postgres",

    host: process.env.DATABASE_HOST || "localhost",
    port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 5432,
    username: process.env.DATABASE_USER || "user",
    password: process.env.DATABASE_PASSWORD || "password",
    database: process.env.DATABASE_NAME || "db",

    synchronize: process.env.DATABASE_SYNCHRONIZE === "true",
    logging: process.env.DATABASE_LOGGING === "true",
    entities: [join(__dirname, "../../../modules/**/*.orm-entity{.ts,.js}")],
    migrations: [join(__dirname, "../migrations/*{.ts,.js}")],
    migrationsRun: false,
    migrationsTableName: "migrations",
    extra: {
      max: 20, // Maximum number of connections in pool
      connectionTimeoutMillis: 2000,
    },
  };
};
