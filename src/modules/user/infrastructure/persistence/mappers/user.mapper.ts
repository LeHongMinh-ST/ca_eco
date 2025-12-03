import { User } from "src/modules/user/domain/entities/user.entity";
import { UserId } from "src/modules/user/domain/value-objects/user-id.vo";
import { UserEmail } from "src/modules/user/domain/value-objects/user-email.vo";
import { UserName } from "src/modules/user/domain/value-objects/user-name.vo";
import { UserPassword } from "src/modules/user/domain/value-objects/user-password.vo";
import { UserOrmEntity } from "../entities/user.orm-entity";

/**
 * UserMapper converts between domain entities and persistence entities
 */
export class UserMapper {
  /**
   * Converts domain User entity to persistence UserOrmEntity
   * @param user - Domain User entity
   * @returns UserOrmEntity for database persistence
   */
  static toPersistence(user: User): UserOrmEntity {
    const ormEntity = new UserOrmEntity();
    ormEntity.id = user.getId().getValue();
    ormEntity.email = user.getEmail().getValue();
    ormEntity.name = user.getName().getValue();
    ormEntity.password = user.getPassword().getValue();
    return ormEntity;
  }

  /**
   * Converts persistence UserOrmEntity to domain User entity
   * @param ormEntity - UserOrmEntity from database
   * @returns Domain User entity
   */
  static toDomain(ormEntity: UserOrmEntity): User {
    const userId = UserId.create(ormEntity.id);
    const email = UserEmail.create(ormEntity.email);
    const name = UserName.create(ormEntity.name);
    const password = UserPassword.create(ormEntity.password);

    // Use reconstitute to avoid raising domain events when loading from database
    return User.reconstitute(userId, email, name, password);
  }
}

