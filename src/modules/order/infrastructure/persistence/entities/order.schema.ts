import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * OrderItemMongoEntity represents the MongoDB embedded document structure for OrderItem
 */
@Schema({ _id: false })
export class OrderItemMongoEntity {
  @Prop({ type: String, required: true })
  id: string; // OrderItemId

  @Prop({ type: String, required: true })
  productId: string;

  @Prop({ type: String, required: true, maxlength: 255 })
  productName: string;

  @Prop({ type: Number, required: true, min: 0 })
  productPrice: number;

  @Prop({ type: Number, required: true, min: 1 })
  quantity: number;

  @Prop({ type: Number, required: true, min: 0 })
  totalPrice: number;
}

/**
 * OrderDocument represents MongoDB document structure for Order
 */
export type OrderDocument = OrderMongoEntity & Document;

/**
 * OrderMongoEntity represents the MongoDB collection structure for Order
 * This is a persistence model, separate from domain entity
 */
@Schema({
  collection: "orders",
  timestamps: true,
  versionKey: false,
})
export class OrderMongoEntity {
  @Prop({ type: String, required: true, unique: true })
  _id: string; // UUID as string

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true, enum: ["PENDING", "CONFIRMED", "PAID", "SHIPPED", "DELIVERED", "CANCELLED", "FAILED"] })
  status: string;

  @Prop({ type: Number, required: true, min: 0 })
  totalPrice: number;

  @Prop({ type: [OrderItemMongoEntity], default: [] })
  items: OrderItemMongoEntity[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

/**
 * Mongoose schema factory for OrderMongoEntity
 */
export const OrderSchema = SchemaFactory.createForClass(OrderMongoEntity);

// Create indexes for better query performance
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

