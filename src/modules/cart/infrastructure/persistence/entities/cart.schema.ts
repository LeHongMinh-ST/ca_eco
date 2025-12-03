import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * CartItemDocument represents MongoDB document structure for CartItem
 */
export type CartItemDocument = CartItemMongoEntity & Document;

/**
 * CartItemMongoEntity represents the MongoDB embedded document structure for CartItem
 */
@Schema({ _id: false })
export class CartItemMongoEntity {
  @Prop({ type: String, required: true })
  id: string; // CartItemId

  @Prop({ type: String, required: true })
  productId: string;

  @Prop({ type: String, required: true, maxlength: 255 })
  productName: string;

  @Prop({ type: Number, required: true, min: 0 })
  productPrice: number;

  @Prop({ type: String, required: true, maxlength: 2048 })
  productImage: string;

  @Prop({ type: Number, required: true, min: 1 })
  quantity: number;
}

/**
 * CartDocument represents MongoDB document structure for Cart
 */
export type CartDocument = CartMongoEntity & Document;

/**
 * CartMongoEntity represents the MongoDB collection structure for Cart
 * This is a persistence model, separate from domain entity
 */
@Schema({
  collection: "carts",
  timestamps: true,
  versionKey: false,
})
export class CartMongoEntity {
  @Prop({ type: String, required: true, unique: true })
  _id: string; // UUID as string

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: [CartItemMongoEntity], default: [] })
  items: CartItemMongoEntity[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

/**
 * Mongoose schema factory for CartMongoEntity
 */
export const CartSchema = SchemaFactory.createForClass(CartMongoEntity);

// Create index on userId for better query performance
CartSchema.index({ userId: 1 });

