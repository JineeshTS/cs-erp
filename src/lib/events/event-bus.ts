/**
 * In-process event bus for cross-module orchestration.
 *
 * Design:
 * - Singleton EventEmitter — handlers registered at import time
 * - Fire-and-forget: emitters never await handlers (decoupled)
 * - All handlers wrapped in try/catch — a failing handler never blocks the emitter
 * - Tenant-scoped: every event carries tenantId, handlers filter as needed
 * - Async handlers run concurrently via Promise.allSettled
 * - Failed handlers get 1 retry with 1s delay
 * - Deduplication: same type+entityId+tenantId within 5s is skipped
 * - Failed events logged to pe_event_log table
 */

import type { DomainEvent, EventType, EventOfType } from "./event-types";
import { createHash } from "crypto";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHandler = (event: any) => Promise<void> | void;
type Handler<T extends EventType> = (event: EventOfType<T>) => Promise<void> | void;

const DEDUP_WINDOW_MS = 5_000;
const RETRY_DELAY_MS = 1_000;

class EventBus {
  private handlers = new Map<EventType, AnyHandler[]>();
  private eventLog: Array<{ type: EventType; tenantId: string; entityId: string; timestamp: Date }> = [];
  private readonly maxLogSize = 1000;
  private recentEventHashes = new Map<string, number>(); // hash → timestamp
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Periodically clean up dedup cache
    this.cleanupTimer = setInterval(() => {
      const cutoff = Date.now() - DEDUP_WINDOW_MS * 2;
      for (const [hash, ts] of this.recentEventHashes) {
        if (ts < cutoff) this.recentEventHashes.delete(hash);
      }
    }, 30_000);
    if (this.cleanupTimer.unref) this.cleanupTimer.unref();
  }

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

  /**
   * Generate a dedup hash for an event.
   */
  private eventHash(event: EventOfType<EventType>): string {
    return createHash("sha256")
      .update(`${event.type}:${event.entityId}:${event.tenantId}`)
      .digest("hex")
      .slice(0, 16);
  }

  /**
   * Check if this event was emitted recently (within DEDUP_WINDOW_MS).
   */
  private isDuplicate(event: EventOfType<EventType>): boolean {
    const hash = this.eventHash(event);
    const lastSeen = this.recentEventHashes.get(hash);
    const now = Date.now();

    if (lastSeen && now - lastSeen < DEDUP_WINDOW_MS) {
      return true;
    }

    this.recentEventHashes.set(hash, now);
    return false;
  }

  /**
   * Log a failed event to the database (best-effort, never throws).
   */
  private async logFailedEvent(event: EventOfType<EventType>, error: unknown): Promise<void> {
    try {
      // Lazy import to avoid circular deps at module load time
      const { db } = await import("@/lib/db");
      const { peEventLog } = await import("@/db/schema");
      await db.insert(peEventLog).values({
        tenantId: event.tenantId,
        eventType: event.type,
        entityType: event.entityType,
        entityId: event.entityId,
        userId: event.userId,
        payload: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack?.slice(0, 500) : undefined,
          eventData: event.data,
          failedAt: new Date().toISOString(),
        },
      });
    } catch {
      // DB logging failed too — nothing more we can do
    }
  }

  /**
   * Execute a handler with 1 retry on failure.
   */
  private async executeWithRetry(
    handler: AnyHandler,
    event: EventOfType<EventType>
  ): Promise<void> {
    try {
      await handler(event);
    } catch (firstError) {
      console.error(`[EventBus] Handler error for ${event.type}, retrying in ${RETRY_DELAY_MS}ms:`, firstError);
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      try {
        await handler(event);
      } catch (retryError) {
        console.error(`[EventBus] Handler retry failed for ${event.type}:`, retryError);
        // Log failed event to DB
        void this.logFailedEvent(event, retryError);
        throw retryError;
      }
    }
  }

  /** Emit an event — fire-and-forget, never throws */
  emit<T extends EventType>(event: EventOfType<T>): void {
    // Deduplication check
    if (this.isDuplicate(event)) {
      console.log(`[EventBus] Skipping duplicate ${event.type} for entity ${event.entityId}`);
      return;
    }

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

    // Run all handlers concurrently with retry, never propagate errors
    void Promise.allSettled(
      handlers.map((handler) => this.executeWithRetry(handler, event))
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
      handlers.map((handler) => this.executeWithRetry(handler, event))
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
