import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IUserRepository } from "src/modules/user/domain/repositories/user.repository.interface";
import { User } from "src/modules/user/domain/entities/user.entity";
import { UserId } from "src/modules/user/domain/value-objects/user-id.vo";
import { UserEmail } from "src/modules/user/domain/value-objects/user-email.vo";
import { UserMongoMapper } from "../mappers/user.mongo-mapper";
import { UserMongoEntity, UserDocument } from "../entities/user.schema";

/**
 * UserMongoRepository implements IUserRepository using Mongoose
 * Handles persistence of User aggregate root in MongoDB
 */
@Injectable()
export class UserMongoRepository implements IUserRepository {
  constructor(
    @InjectModel(UserMongoEntity.name)
    private readonly mongoModel: Model<UserDocument>,
  ) {}

  /**
   * Saves a user entity
   * Creates new user if not exists, updates if exists
   * @param user - User entity to save
   * @returns Promise that resolves when save is complete
   */
  async save(user: User): Promise<void> {
    const mongoEntity = UserMongoMapper.toPersistence(user);
    await this.mongoModel.findByIdAndUpdate(
      user.getId().getValue(),
      mongoEntity,
      { upsert: true, new: true },
    );
  }

  /**
   * Finds a user by its ID
   * @param id - User identifier
   * @returns Promise that resolves to User entity or undefined if not found
   */
  async findById(id: UserId): Promise<User | undefined> {
    const document = await this.mongoModel.findById(id.getValue()).exec();
    if (!document) {
      return undefined;
    }
    return UserMongoMapper.toDomain(document);
  }

  /**
   * Finds a user by email
   * @param email - User email
   * @returns Promise that resolves to User entity or undefined if not found
   */
  async findByEmail(email: UserEmail): Promise<User | undefined> {
    const document = await this.mongoModel
      .findOne({ email: email.getValue() })
      .exec();
    if (!document) {
      return undefined;
    }
    return UserMongoMapper.toDomain(document);
  }

  /**
   * Checks if a user exists by ID
   * @param id - User identifier
   * @returns Promise that resolves to true if user exists, false otherwise
   */
  async exists(id: UserId): Promise<boolean> {
    const count = await this.mongoModel.countDocuments({
      _id: id.getValue(),
    });
    return count > 0;
  }

  /**
   * Checks if a user exists by email
   * @param email - User email
   * @returns Promise that resolves to true if user exists, false otherwise
   */
  async existsByEmail(email: UserEmail): Promise<boolean> {
    const count = await this.mongoModel.countDocuments({
      email: email.getValue(),
    });
    return count > 0;
  }

  /**
   * Deletes a user by ID
   * @param id - User identifier
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: UserId): Promise<void> {
    await this.mongoModel.findByIdAndDelete(id.getValue()).exec();
  }
}

