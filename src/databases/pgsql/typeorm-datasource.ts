import { DataSource } from "typeorm";
import { config as loadEnv } from "dotenv";
import { join } from "path";


const rootDir = process.cwd();
loadEnv({ path: join(rootDir, ".env") });
loadEnv({ path: join(rootDir, ".env.local"), override: true });

const databaseHost = process.env.DATABASE_HOST || "localhost";
const databasePort = parseInt(process.env.DATABASE_PORT || "5433", 10);
const databaseName = process.env.DATABASE_NAME || "stayly_db";
const databaseUser = process.env.DATABASE_USER || "stayly_user";

const databasePassword = process.env.DATABASE_PASSWORD || "stayly_password";
const logging = process.env.DATABASE_LOGGING === "true";

const dataSource = new DataSource({
  type: "postgres",
  host: databaseHost,
  port: databasePort,
  username: databaseUser,
  password: databasePassword,
  database: databaseName,
  synchronize: false,
  logging,
  entities: [
    join(

      rootDir,
      "src/modules/**/infrastructure/persistence/entities/*{.ts,.js}",
    ),
  ],
  migrations: [join(rootDir, "src/migrations/*{.ts,.js}")],
});

export default dataSource;

