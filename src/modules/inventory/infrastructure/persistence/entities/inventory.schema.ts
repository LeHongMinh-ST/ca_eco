import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * InventoryDocument represents MongoDB document structure for Inventory
 */
export type InventoryDocument = InventoryMongoEntity & Document;

/**
 * InventoryMongoEntity represents the MongoDB collection structure for Inventory
 * This is a persistence model, separate from domain entity
 */
@Schema({
  collection: "inventories",
  timestamps: true,
  versionKey: false,
})
export class InventoryMongoEntity {
  @Prop({ type: String, required: true, unique: true })
  _id: string; // UUID as string

  @Prop({ type: String, required: true, unique: true })
  productId: string;

  @Prop({ type: Number, required: true, min: 0 })
  quantity: number;

  @Prop({ type: Number, default: 10, min: 0 })
  lowStockThreshold: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

/**
 * Mongoose schema factory for InventoryMongoEntity
 */
export const InventorySchema = SchemaFactory.createForClass(InventoryMongoEntity);

// Create indexes for better query performance
InventorySchema.index({ productId: 1 }, { unique: true });

