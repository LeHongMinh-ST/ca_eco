import { DynamicModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { OutboxEventOrmEntity } from "./outbox-event.orm-entity";
import { OutboxRepository } from "./outbox.repository";
import {
  OutboxEventMongoEntity,
  OutboxEventSchema,
} from "./outbox-event.schema";
import { OutboxMongoRepository } from "./outbox.mongo-repository";
import {
  IOutboxRepository,
  OutboxRepositoryToken,
} from "../../application/events/outbox-repository.interface";
import { OutboxEventDispatcher } from "../events/outbox-event-dispatcher";
import {
  IDomainEventDispatcher,
  DomainEventDispatcherToken,
} from "../../application/events/domain-event-dispatcher.interface";
import { EventHandlersRegistry } from "../../application/events/event-handlers-registry";
import { OutboxProcessor } from "./outbox-processor";
import { DatabaseType } from "../../../databases/database.factory";

/**
 * OutboxModule dynamically configures persistence layer based on DB_TYPE
 * Supports both PostgreSQL (TypeORM) and MongoDB (Mongoose)
 * Automatically selects appropriate repository based on environment variable
 */
@Module({})
export class OutboxModule {
  /**
   * Creates OutboxModule with appropriate database configuration
   * Dynamically imports the appropriate database module based on DB_TYPE
   * @returns DynamicModule configured for PostgreSQL or MongoDB
   */
  static forRoot(): DynamicModule {
    const dbType = (process.env.DB_TYPE || DatabaseType.POSTGRES).toLowerCase();

    let repositoryClass: typeof OutboxMongoRepository | typeof OutboxRepository;
    const imports: any[] = [ScheduleModule.forRoot()];

    switch (dbType) {
      case DatabaseType.MONGODB.toLowerCase():
        imports.push(
          MongooseModule.forFeature([
            { name: OutboxEventMongoEntity.name, schema: OutboxEventSchema },
          ]),
        );
        repositoryClass = OutboxMongoRepository;
        break;
      case DatabaseType.POSTGRES.toLowerCase():
      default:
        imports.push(TypeOrmModule.forFeature([OutboxEventOrmEntity]));
        repositoryClass = OutboxRepository;
        break;
    }

    return {
      module: OutboxModule,
      imports,
      providers: [
        // Repository
        {
          provide: OutboxRepositoryToken,
          useClass: repositoryClass,
        },
        // Event dispatcher
        {
          provide: DomainEventDispatcherToken,
          useClass: OutboxEventDispatcher,
        },
        // Event handlers registry
        EventHandlersRegistry,
        // Background processor
        OutboxProcessor,
      ],
      exports: [DomainEventDispatcherToken, EventHandlersRegistry],
    };
  }
}

