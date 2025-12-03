import { Injectable } from "@nestjs/common";
import { IEventHandler } from "./event-handler.interface";

/**
 * EventHandlersRegistry manages registration and retrieval of event handlers
 * Maps event types to their corresponding handlers
 */
@Injectable()
export class EventHandlersRegistry {
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
  }

  /**
   * Gets all handlers registered for an event type
   * @param eventType - Event type name
   * @returns Array of event handlers, or empty array if none registered
   */
  getHandlers(eventType: string): IEventHandler[] {
    return this.handlers.get(eventType) || [];
  }

  /**
   * Gets all registered event types
   * @returns Array of event type names
   */
  getRegisteredEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}

