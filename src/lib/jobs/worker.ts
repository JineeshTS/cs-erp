import { Worker, Job } from "bullmq";
import { QUEUE_NAMES, type CronJobType } from "./queue";

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
      // TODO: Wire to human-gate-manager.ts checkGateSlas()
      console.log("[CronWorker] SLA check — placeholder");
      break;

    case "session-cleanup": {
      // Call the internal API endpoint
      const apiKey = process.env.INTERNAL_API_KEY;
      if (!apiKey) { console.warn("[CronWorker] INTERNAL_API_KEY not set"); break; }
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100";
      const res = await fetch(`${baseUrl}/api/internal/cron/session-cleanup`, {
        method: "POST",
        headers: { "x-internal-api-key": apiKey },
      });
      const data = await res.json();
      console.log("[CronWorker] Session cleanup:", data);
      break;
    }

    case "overdue-invoices": {
      const apiKey = process.env.INTERNAL_API_KEY;
      if (!apiKey) { console.warn("[CronWorker] INTERNAL_API_KEY not set"); break; }
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100";
      const res = await fetch(`${baseUrl}/api/internal/cron/overdue-invoices`, {
        method: "POST",
        headers: { "x-internal-api-key": apiKey },
      });
      const data = await res.json();
      console.log("[CronWorker] Overdue invoices:", data);
      break;
    }

    case "retention-enforce":
      // TODO: Wire to dms_retention_policies enforcement
      console.log("[CronWorker] Retention enforcement — placeholder");
      break;

    case "fx-rate-refresh":
      // TODO: Wire to exchange rate API feed
      console.log("[CronWorker] FX rate refresh — placeholder");
      break;

    case "certificate-expiry-check":
      // TODO: Wire to vtm_survey_trackings expiry alerting
      console.log("[CronWorker] Certificate expiry check — placeholder");
      break;

    case "notification-digest":
      // TODO: Wire to notification digest email batching
      console.log("[CronWorker] Notification digest — placeholder");
      break;

    default:
      console.warn(`[CronWorker] Unknown job type: ${type}`);
  }

  console.log(`[CronWorker] ${type} completed in ${Date.now() - startTime}ms`);
}

// ── Notification job handlers ────────────────────────────────────

async function handleNotificationJob(job: Job) {
  const type = job.data.type;
  console.log(`[NotificationWorker] Processing ${type}:`, job.data);
  // TODO: Wire to email/WhatsApp providers
}

// ── Import/Export job handlers ───────────────────────────────────

async function handleImportExportJob(job: Job) {
  const type = job.data.type;
  console.log(`[ImportExportWorker] Processing ${type}:`, job.data);
  // TODO: Wire to CSV parser / Excel generator / PDF renderer
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

  return { cronWorker, notificationWorker, importExportWorker };
}
