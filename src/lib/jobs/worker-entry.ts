/**
 * F-016: BullMQ Worker Docker Service — Standalone Entrypoint
 *
 * This file is the CMD entrypoint for the cs-erp-worker Docker container.
 * It starts BullMQ workers and cron schedules, runs a /health HTTP server,
 * and handles graceful shutdown on SIGTERM/SIGINT.
 *
 * Run: npx tsx src/lib/jobs/worker-entry.ts
 */

import http from "node:http";
import { startWorkers, type WorkerHandles } from "./worker";
import { setupCronSchedules, QUEUE_NAMES } from "./queue";

const HEALTH_PORT = parseInt(process.env.WORKER_HEALTH_PORT || "3101", 10);

let workers: WorkerHandles | null = null;
let shuttingDown = false;

// ── Health check server ─────────────────────────────────────────

const healthServer = http.createServer((_req, res) => {
  if (_req.url === "/health" && _req.method === "GET") {
    const healthy = workers !== null && !shuttingDown;
    res.writeHead(healthy ? 200 : 503, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: healthy ? "ok" : "unhealthy",
        uptime: process.uptime(),
        workers: workers
          ? Object.keys(workers).map((k) => k.replace("Worker", ""))
          : [],
        shuttingDown,
      })
    );
  } else {
    res.writeHead(404);
    res.end();
  }
});

// ── Graceful shutdown ───────────────────────────────────────────

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[WorkerEntry] ${signal} received — shutting down gracefully`);

  const timeout = setTimeout(() => {
    console.error("[WorkerEntry] Shutdown timed out after 30s — forcing exit");
    process.exit(1);
  }, 30_000);

  try {
    if (workers) {
      await Promise.all([
        workers.cronWorker.close(),
        workers.notificationWorker.close(),
        workers.importExportWorker.close(),
      ]);
      console.log("[WorkerEntry] All workers closed");
    }

    healthServer.close();
    clearTimeout(timeout);
    process.exit(0);
  } catch (err) {
    console.error("[WorkerEntry] Error during shutdown:", err);
    clearTimeout(timeout);
    process.exit(1);
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  console.error("[WorkerEntry] Unhandled rejection:", reason);
  // Do NOT crash — let other jobs continue processing
});

// ── Startup ─────────────────────────────────────────────────────

async function main() {
  console.log("[WorkerEntry] Starting BullMQ worker service");
  console.log(`[WorkerEntry] Redis: ${process.env.REDIS_URL ? "configured" : "default (localhost)"}`);
  console.log(`[WorkerEntry] Queues: ${Object.values(QUEUE_NAMES).join(", ")}`);

  // Start health check server first (so Docker can check status during startup)
  healthServer.listen(HEALTH_PORT, "0.0.0.0", () => {
    console.log(`[WorkerEntry] Health check: http://0.0.0.0:${HEALTH_PORT}/health`);
  });

  // Start workers (BullMQ handles Redis reconnection natively)
  workers = startWorkers();
  console.log("[WorkerEntry] Workers started: cron(2), notifications(5), import-export(1)");

  // Setup cron schedules (retry if Redis not ready yet)
  let cronRetries = 0;
  while (cronRetries < 10) {
    try {
      await setupCronSchedules();
      console.log("[WorkerEntry] 7 cron schedules configured");
      break;
    } catch (err) {
      cronRetries++;
      if (cronRetries >= 10) {
        console.error("[WorkerEntry] Failed to setup cron after 10 retries:", err);
        break;
      }
      console.warn(`[WorkerEntry] Cron setup retry ${cronRetries}/10 — waiting 3s`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  console.log("[WorkerEntry] Ready");
}

main().catch((err) => {
  console.error("[WorkerEntry] Fatal startup error:", err);
  process.exit(1);
});
