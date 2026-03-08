/**
 * In-process event bus for cross-module orchestration.
 *
 * Design:
 * - Singleton EventEmitter — handlers registered at import time
 * - Fire-and-forget: emitters never await handlers (decoupled)
 * - All handlers wrapped in try/catch — a failing handler never blocks the emitter
 * - Tenant-scoped: every event carries tenantId, handlers filter as needed
 * - Async handlers run concurrently via Promise.allSettled
 */

import type { DomainEvent, EventType, EventOfType } from "./event-types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHandler = (event: any) => Promise<void> | void;
type Handler<T extends EventType> = (event: EventOfType<T>) => Promise<void> | void;

class EventBus {
  private handlers = new Map<EventType, AnyHandler[]>();
  private eventLog: Array<{ type: EventType; tenantId: string; entityId: string; timestamp: Date }> = [];
  private readonly maxLogSize = 1000;

  /** Register a handler for a specific event type */
  on<T extends EventType>(type: T, handler: Handler<T>): void {
    const existing = this.handlers.get(type) ?? [];
    existing.push(handler as AnyHandler);
    this.handlers.set(type, existing);
  }

  /** Remove a handler */
  off<T extends EventType>(type: T, handler: Handler<T>): void {
    const existing = this.handlers.get(type);
    if (!existing) return;
    const idx = existing.indexOf(handler as AnyHandler);
    if (idx !== -1) existing.splice(idx, 1);
  }

  /** Emit an event — fire-and-forget, never throws */
  emit<T extends EventType>(event: EventOfType<T>): void {
    // Audit log (ring buffer)
    this.eventLog.push({
      type: event.type,
      tenantId: event.tenantId,
      entityId: event.entityId,
      timestamp: event.timestamp,
    });
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }

    const handlers = this.handlers.get(event.type);
    if (!handlers || handlers.length === 0) return;

    // Run all handlers concurrently, never propagate errors
    void Promise.allSettled(
      handlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (err) {
          console.error(`[EventBus] Handler error for ${event.type}:`, err);
        }
      })
    );
  }

  /** Emit and wait for all handlers to complete (useful for testing) */
  async emitAndWait<T extends EventType>(event: EventOfType<T>): Promise<PromiseSettledResult<void>[]> {
    this.eventLog.push({
      type: event.type,
      tenantId: event.tenantId,
      entityId: event.entityId,
      timestamp: event.timestamp,
    });
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }

    const handlers = this.handlers.get(event.type);
    if (!handlers || handlers.length === 0) return [];

    return Promise.allSettled(
      handlers.map(async (handler) => {
        await handler(event);
      })
    );
  }

  /** Get recent event log (for debugging / admin) */
  getRecentEvents(limit = 50): typeof this.eventLog {
    return this.eventLog.slice(-limit);
  }

  /** Get count of registered handlers per event type */
  getHandlerCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const [type, handlers] of this.handlers) {
      counts[type] = handlers.length;
    }
    return counts;
  }
}

/** Singleton event bus instance */
export const eventBus = new EventBus();
