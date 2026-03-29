import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { execSync } from "child_process";
import { existsSync, mkdirSync, readdirSync, unlinkSync, statSync } from "fs";
import { join } from "path";

const BACKUP_DIR = process.env.BACKUP_DIR || "/tmp/cs-erp-backups";
const MAX_BACKUPS = parseInt(process.env.MAX_BACKUPS || "7", 10);
const DATABASE_URL = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL || "";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-internal-api-key");
  const expected = process.env.INTERNAL_API_KEY;
  if (!apiKey || !expected) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Missing API key" } }, { status: 401 });
  }

  const a = Buffer.from(apiKey);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Invalid API key" } }, { status: 401 });
  }

  if (!DATABASE_URL) {
    return NextResponse.json({ error: { code: "CONFIG_ERROR", message: "DATABASE_URL not set" } }, { status: 500 });
  }

  try {
    // Ensure backup directory exists
    if (!existsSync(BACKUP_DIR)) {
      mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `cs_erp_backup_${timestamp}.sql.gz`;
    const filepath = join(BACKUP_DIR, filename);

    // Run pg_dump with gzip compression
    execSync(
      `pg_dump "${DATABASE_URL}" --no-owner --no-acl --clean --if-exists | gzip > "${filepath}"`,
      { timeout: 300000, stdio: ["pipe", "pipe", "pipe"] }
    );

    const stats = statSync(filepath);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

    // Rotate old backups — keep only MAX_BACKUPS most recent
    const backups = readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith("cs_erp_backup_") && f.endsWith(".sql.gz"))
      .sort()
      .reverse();

    let removed = 0;
    for (const old of backups.slice(MAX_BACKUPS)) {
      unlinkSync(join(BACKUP_DIR, old));
      removed++;
    }

    console.log(`[db-backup] Created ${filename} (${sizeMb} MB), removed ${removed} old backups, ${Math.min(backups.length, MAX_BACKUPS)} retained`);

    return NextResponse.json({
      data: {
        filename,
        sizeMb: parseFloat(sizeMb),
        path: filepath,
        retained: Math.min(backups.length, MAX_BACKUPS),
        removed,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[db-backup] Failed:", error);
    return NextResponse.json(
      { error: { code: "BACKUP_FAILED", message: "Database backup failed" } },
      { status: 500 }
    );
  }
}
