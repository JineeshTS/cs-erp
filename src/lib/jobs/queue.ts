import { Queue, Worker, Job } from "bullmq";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Parse Redis URL for BullMQ connection
function parseRedisUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || "6379", 10),
    password: parsed.password || undefined,
    db: parseInt(parsed.pathname?.slice(1) || "0", 10),
  };
}

const connection = parseRedisUrl(REDIS_URL);

// ── Queue names ──────────────────────────────────────────────────

export const QUEUE_NAMES = {
  CRON: "cs-erp:cron",
  NOTIFICATIONS: "cs-erp:notifications",
  IMPORT_EXPORT: "cs-erp:import-export",
  REPORTS: "cs-erp:reports",
} as const;

// ── Job types ────────────────────────────────────────────────────

export type CronJobType =
  | "sla-check"
  | "session-cleanup"
  | "overdue-invoices"
  | "retention-enforce"
  | "fx-rate-refresh"
  | "certificate-expiry-check"
  | "notification-digest";

export type NotificationJobType =
  | "send-email"
  | "send-email-digest"
  | "send-whatsapp";

export type ImportExportJobType =
  | "csv-import"
  | "excel-export"
  | "pdf-report";

// ── Queue instances ──────────────────────────────────────────────

let cronQueue: Queue | null = null;
let notificationQueue: Queue | null = null;
let importExportQueue: Queue | null = null;

export function getCronQueue(): Queue {
  if (!cronQueue) {
    cronQueue = new Queue(QUEUE_NAMES.CRON, { connection });
  }
  return cronQueue;
}

export function getNotificationQueue(): Queue {
  if (!notificationQueue) {
    notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATIONS, { connection });
  }
  return notificationQueue;
}

export function getImportExportQueue(): Queue {
  if (!importExportQueue) {
    importExportQueue = new Queue(QUEUE_NAMES.IMPORT_EXPORT, { connection });
  }
  return importExportQueue;
}

// ── Enqueue helpers ──────────────────────────────────────────────

export async function enqueueCronJob(
  type: CronJobType,
  data?: Record<string, unknown>
) {
  const queue = getCronQueue();
  return queue.add(type, { type, ...data }, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  });
}

export async function enqueueNotification(
  type: NotificationJobType,
  data: Record<string, unknown>
) {
  const queue = getNotificationQueue();
  return queue.add(type, { type, ...data }, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 500,
    removeOnFail: 1000,
  });
}

export async function enqueueImportExport(
  type: ImportExportJobType,
  data: Record<string, unknown>
) {
  const queue = getImportExportQueue();
  return queue.add(type, { type, ...data }, {
    attempts: 2,
    backoff: { type: "fixed", delay: 10000 },
    removeOnComplete: 50,
    removeOnFail: 200,
  });
}

// ── Cron schedule setup ──────────────────────────────────────────

export async function setupCronSchedules() {
  const queue = getCronQueue();

  // Remove existing repeatable jobs before re-adding (idempotent)
  const existing = await queue.getRepeatableJobs();
  for (const job of existing) {
    await queue.removeRepeatableByKey(job.key);
  }

  // SLA check — every 5 minutes
  await queue.add("sla-check", { type: "sla-check" }, {
    repeat: { pattern: "*/5 * * * *" },
    removeOnComplete: 10,
  });

  // Session cleanup — every hour
  await queue.add("session-cleanup", { type: "session-cleanup" }, {
    repeat: { pattern: "0 * * * *" },
    removeOnComplete: 5,
  });

  // Overdue invoices — every 6 hours
  await queue.add("overdue-invoices", { type: "overdue-invoices" }, {
    repeat: { pattern: "0 */6 * * *" },
    removeOnComplete: 5,
  });

  // Certificate expiry check — daily at 06:00
  await queue.add("certificate-expiry-check", { type: "certificate-expiry-check" }, {
    repeat: { pattern: "0 6 * * *" },
    removeOnComplete: 5,
  });

  // Notification digest — every hour
  await queue.add("notification-digest", { type: "notification-digest" }, {
    repeat: { pattern: "30 * * * *" },
    removeOnComplete: 10,
  });

  // Data retention enforcement — daily at 02:00
  await queue.add("retention-enforce", { type: "retention-enforce" }, {
    repeat: { pattern: "0 2 * * *" },
    removeOnComplete: 5,
  });

  console.log("[Jobs] Cron schedules configured");
}
