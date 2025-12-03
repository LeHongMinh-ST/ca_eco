import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * UserDocument represents MongoDB document structure for User
 * Extends Mongoose Document for type safety
 */
export type UserDocument = UserMongoEntity & Document;

/**
 * UserMongoEntity represents the MongoDB collection structure for User
 * This is a persistence model, separate from domain entity
 */
@Schema({
  collection: "users",
  timestamps: true,
  versionKey: false,
})
export class UserMongoEntity {
  @Prop({ type: String, required: true, unique: true })
  _id: string; // UUID as string

  @Prop({ type: String, required: true, unique: true, maxlength: 255 })
  email: string;

  @Prop({ type: String, required: true, maxlength: 255 })
  name: string;

  @Prop({ type: String, required: true, maxlength: 255 })
  password: string; // Hashed password

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

/**
 * Mongoose schema factory for UserMongoEntity
 */
export const UserSchema = SchemaFactory.createForClass(UserMongoEntity);

// Create index on email for better search performance
UserSchema.index({ email: 1 }, { unique: true });

