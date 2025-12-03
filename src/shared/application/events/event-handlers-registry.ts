import { Injectable, Global, Logger } from "@nestjs/common";
import { IEventHandler } from "./event-handler.interface";

/**
 * EventHandlersRegistry manages registration and retrieval of event handlers
 * Maps event types to their corresponding handlers
 *
 * Marked as Global to ensure single instance across all modules
 */
@Global()
@Injectable()
export class EventHandlersRegistry {
  private readonly logger = new Logger(EventHandlersRegistry.name);
  private readonly handlers: Map<string, IEventHandler[]> = new Map();

  /**
   * Registers an event handler for a specific event type
   * @param eventType - Event type name (e.g., "ProductCreated")
   * @param handler - Event handler instance
   */
  register(eventType: string, handler: IEventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    this.logger.log(
      `Registered handler ${handler.constructor.name} for event type: ${eventType}. Total handlers for ${eventType}: ${this.handlers.get(eventType)!.length}`,
    );
  }

  /**
   * Gets all handlers registered for an event type
   * @param eventType - Event type name
   * @returns Array of event handlers, or empty array if none registered
   */
  getHandlers(eventType: string): IEventHandler[] {
    const handlers = this.handlers.get(eventType) || [];
    this.logger.debug(
      `Getting handlers for ${eventType}: found ${handlers.length} handlers. Registered event types: ${Array.from(this.handlers.keys()).join(", ")}`,
    );
    return handlers;
  }

  /**
   * Gets all registered event types
   * @returns Array of event type names
   */
  getRegisteredEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}
