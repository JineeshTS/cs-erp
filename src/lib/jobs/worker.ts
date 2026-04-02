import { Worker, Job } from "bullmq";
import { QUEUE_NAMES, type CronJobType, type NotificationJobType, type ImportExportJobType } from "./queue";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

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

// ── Cron job handlers ────────────────────────────────────────────

async function handleCronJob(job: Job) {
  const type = job.data.type as CronJobType;
  const startTime = Date.now();
  console.log(`[CronWorker] Starting ${type}`);

  switch (type) {
    case "sla-check":
    case "session-cleanup":
    case "overdue-invoices":
    case "retention-enforce":
    case "fx-rate-refresh":
    case "certificate-expiry-check":
    case "notification-digest":
    case "db-backup": {
      const apiKey = process.env.INTERNAL_API_KEY;
      if (!apiKey) { console.warn("[CronWorker] INTERNAL_API_KEY not set"); break; }
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100";
      const res = await fetch(`${baseUrl}/api/internal/cron/${type}`, {
        method: "POST",
        headers: { "x-internal-api-key": apiKey },
        signal: AbortSignal.timeout(30000),
      });
      const data = await res.json();
      console.log(`[CronWorker] ${type}:`, data);
      break;
    }

    default:
      console.warn(`[CronWorker] Unknown job type: ${type}`);
  }

  console.log(`[CronWorker] ${type} completed in ${Date.now() - startTime}ms`);
}

// ── Notification job handlers ────────────────────────────────────

async function handleNotificationJob(job: Job) {
  const type = job.data.type as NotificationJobType;
  const startTime = Date.now();
  console.log(`[NotificationWorker] Processing ${type}`);

  const apiKey = process.env.INTERNAL_API_KEY;
  if (!apiKey) { console.warn("[NotificationWorker] INTERNAL_API_KEY not set"); return; }
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100";

  switch (type) {
    case "send-email": {
      const { to, subject, html } = job.data as { to: string; subject: string; html: string };
      if (!to || !subject) { console.warn("[NotificationWorker] Missing to/subject"); return; }
      const res = await fetch(`${baseUrl}/api/internal/notifications/send-email`, {
        method: "POST",
        headers: { "x-internal-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, html }),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) console.error(`[NotificationWorker] send-email failed: ${res.status}`);
      break;
    }

    case "send-email-digest": {
      const res = await fetch(`${baseUrl}/api/internal/cron/notification-digest`, {
        method: "POST",
        headers: { "x-internal-api-key": apiKey },
        signal: AbortSignal.timeout(30000),
      });
      const data = await res.json();
      console.log(`[NotificationWorker] digest:`, data);
      break;
    }

    case "send-whatsapp": {
      console.log(`[NotificationWorker] WhatsApp not yet configured — logged for:`, job.data.to);
      break;
    }

    default:
      console.warn(`[NotificationWorker] Unknown type: ${type}`);
  }

  console.log(`[NotificationWorker] ${type} completed in ${Date.now() - startTime}ms`);
}

// ── Import/Export job handlers ───────────────────────────────────

async function handleImportExportJob(job: Job) {
  const type = job.data.type as ImportExportJobType;
  const startTime = Date.now();
  console.log(`[ImportExportWorker] Processing ${type}`);

  const apiKey = process.env.INTERNAL_API_KEY;
  if (!apiKey) { console.warn("[ImportExportWorker] INTERNAL_API_KEY not set"); return; }
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100";

  switch (type) {
    case "csv-import":
    case "excel-export":
    case "pdf-report": {
      const res = await fetch(`${baseUrl}/api/internal/jobs/${type}`, {
        method: "POST",
        headers: { "x-internal-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify(job.data),
        signal: AbortSignal.timeout(120000),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`[ImportExportWorker] ${type} failed (${res.status}): ${text}`);
      }
      const data = await res.json();
      console.log(`[ImportExportWorker] ${type}:`, data);
      break;
    }

    default:
      console.warn(`[ImportExportWorker] Unknown type: ${type}`);
  }

  console.log(`[ImportExportWorker] ${type} completed in ${Date.now() - startTime}ms`);
}

// ── Start workers ────────────────────────────────────────────────

export function startWorkers() {
  const cronWorker = new Worker(QUEUE_NAMES.CRON, handleCronJob, {
    connection,
    concurrency: 2,
  });

  const notificationWorker = new Worker(QUEUE_NAMES.NOTIFICATIONS, handleNotificationJob, {
    connection,
    concurrency: 5,
  });

  const importExportWorker = new Worker(QUEUE_NAMES.IMPORT_EXPORT, handleImportExportJob, {
    connection,
    concurrency: 1,
  });

  // Error handlers
  for (const worker of [cronWorker, notificationWorker, importExportWorker]) {
    worker.on("failed", (job, err) => {
      console.error(`[Worker] Job ${job?.name} failed:`, err.message);
    });
    worker.on("error", (err) => {
      console.error("[Worker] Error:", err.message);
    });
  }

  console.log("[Jobs] Workers started: cron, notifications, import-export");

  return { cronWorker, notificationWorker, importExportWorker } satisfies WorkerHandles;
}

export type WorkerHandles = {
  cronWorker: Worker;
  notificationWorker: Worker;
  importExportWorker: Worker;
};
