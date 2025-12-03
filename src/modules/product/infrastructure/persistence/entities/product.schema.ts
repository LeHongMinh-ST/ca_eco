import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * ProductDocument represents MongoDB document structure for Product
 * Extends Mongoose Document for type safety
 */
export type ProductDocument = ProductMongoEntity & Document;

/**
 * ProductMongoEntity represents the MongoDB collection structure for Product
 * This is a persistence model, separate from domain entity
 */
@Schema({
  collection: "products",
  timestamps: true,
  versionKey: false,
})
export class ProductMongoEntity {
  @Prop({ type: String, required: true, unique: true })
  _id: string; // UUID as string

  @Prop({ type: String, required: true, maxlength: 255 })
  name: string;

  @Prop({ type: Number, required: true, min: 0 })
  price: number;

  @Prop({ type: String, required: true, maxlength: 2048 })
  image: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

/**
 * Mongoose schema factory for ProductMongoEntity
 */
export const ProductSchema = SchemaFactory.createForClass(ProductMongoEntity);

// Create index on name for better search performance
ProductSchema.index({ name: "text" });
