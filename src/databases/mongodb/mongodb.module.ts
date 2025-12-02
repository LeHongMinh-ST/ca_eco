/**
 * MongoDB Module
 * Configures Mongoose with MongoDB
 */

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { getMongoConfig } from "./mongodb.config";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: getMongoConfig,
    }),
  ],
  exports: [MongooseModule],
})
export class MongoDBModule {}
