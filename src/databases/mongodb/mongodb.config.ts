/**
 * MongoDB configuration
 * Exports Mongoose configuration object
 */

import { MongooseModuleOptions } from "@nestjs/mongoose";

/**
 * Get MongoDB configuration from environment variables
 */
export const getMongoConfig = (): MongooseModuleOptions => {
  const uri =
    process.env.MONGO_URI ||
    `mongodb://${process.env.MONGO_USER || "mongo_user"}:${process.env.MONGO_PASSWORD || "mongo_password"}@${process.env.MONGO_HOST || "localhost"}:${process.env.MONGO_PORT || "27017"}/${process.env.MONGO_DB || "ca_eco"}?authSource=admin`;

  return {
    uri,
    retryWrites: true,
    w: "majority",
  };
};
