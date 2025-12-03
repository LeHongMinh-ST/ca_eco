import { User } from "src/modules/user/domain/entities/user.entity";
import { UserId } from "src/modules/user/domain/value-objects/user-id.vo";
import { UserEmail } from "src/modules/user/domain/value-objects/user-email.vo";
import { UserName } from "src/modules/user/domain/value-objects/user-name.vo";
import { UserPassword } from "src/modules/user/domain/value-objects/user-password.vo";
import {
  UserMongoEntity,
  UserDocument,
} from "../entities/user.schema";

/**
 * UserMongoMapper converts between domain entities and MongoDB documents
 */
export class UserMongoMapper {
  /**
   * Converts domain User entity to MongoDB document
   * @param user - Domain User entity
   * @returns UserMongoEntity for MongoDB persistence
   */
  static toPersistence(user: User): Partial<UserMongoEntity> {
    return {
      _id: user.getId().getValue(),
      email: user.getEmail().getValue(),
      name: user.getName().getValue(),
      password: user.getPassword().getValue(),
    };
  }

  /**
   * Converts MongoDB document to domain User entity
   * @param document - UserDocument from MongoDB
   * @returns Domain User entity
   */
  static toDomain(document: UserDocument | UserMongoEntity): User {
    const userId = UserId.create(document._id);
    const email = UserEmail.create(document.email);
    const name = UserName.create(document.name);
    const password = UserPassword.create(document.password);

    // Use reconstitute to avoid raising domain events when loading from database
    return User.reconstitute(userId, email, name, password);
  }
}

