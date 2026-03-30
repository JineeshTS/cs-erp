/**
 * ERP-096: Offline Sync Placeholder — client-side utility for future use.
 *
 * Stores offline actions in localStorage and replays them when back online.
 * No service worker — just the queue API for future integration.
 */

const OFFLINE_QUEUE_KEY = "cs_erp_offline_queue";

export interface OfflineAction {
  id: string;
  entityType: string;
  entityId: string;
  actionType: "create" | "update" | "delete";
  data: Record<string, unknown>;
  createdAt: string;
}

/**
 * Queue an action to be replayed when back online.
 */
export function queueOfflineAction(action: {
  entityType: string;
  entityId: string;
  actionType: "create" | "update" | "delete";
  data: Record<string, unknown>;
}): void {
  if (typeof window === "undefined") return;

  const queue = getQueue();
  const entry: OfflineAction = {
    id: crypto.randomUUID(),
    entityType: action.entityType,
    entityId: action.entityId,
    actionType: action.actionType,
    data: action.data,
    createdAt: new Date().toISOString(),
  };

  queue.push(entry);
  saveQueue(queue);
}

/**
 * Replay all queued offline actions.
 * Calls the appropriate API endpoint for each action, removing successful ones.
 * Returns the count of successfully synced and failed actions.
 */
export async function syncOfflineActions(): Promise<{
  synced: number;
  failed: number;
}> {
  if (typeof window === "undefined") return { synced: 0, failed: 0 };

  const queue = getQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const remaining: OfflineAction[] = [];

  for (const action of queue) {
    try {
      const endpoint = `/api/v1/${action.entityType}${
        action.actionType === "create" ? "" : `/${action.entityId}`
      }`;

      const method =
        action.actionType === "create"
          ? "POST"
          : action.actionType === "update"
            ? "PATCH"
            : "DELETE";

      const res = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: method !== "DELETE" ? JSON.stringify(action.data) : undefined,
      });

      if (res.ok) {
        synced++;
      } else {
        // Keep failed actions for retry unless it's a 4xx client error
        if (res.status >= 400 && res.status < 500) {
          // Client error — discard, won't succeed on retry
          failed++;
        } else {
          remaining.push(action);
          failed++;
        }
      }
    } catch {
      // Network error — keep for retry
      remaining.push(action);
      failed++;
    }
  }

  saveQueue(remaining);
  return { synced, failed };
}

/**
 * Returns the count of pending offline actions.
 */
export function getOfflineQueueSize(): number {
  if (typeof window === "undefined") return 0;
  return getQueue().length;
}

// ── Internal helpers ──

function getQueue(): OfflineAction[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: OfflineAction[]): void {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}
