import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { createGzip } from "zlib";
import path from "path";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

const PROJECT_ROOT = process.cwd();

async function checkAdmin(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return { error: unauthorizedResponse() };
  if (!(await hasPermission(user.id, user.tenantId, "admin:read"))) {
    return { error: forbiddenResponse() };
  }
  return { user };
}

function sqlResponse(content: string, filename: string) {
  return new NextResponse(content, {
    headers: {
      "Content-Type": "application/sql",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function textResponse(content: string, filename: string, contentType = "text/plain") {
  return new NextResponse(content, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

/**
 * Recursively collect all files under a directory, returning relative paths.
 */
function collectFiles(dir: string, base: string): string[] {
  const results: string[] = [];
  if (!existsSync(dir)) return results;

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(base, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, relPath));
    } else {
      results.push(relPath);
    }
  }
  return results;
}

/**
 * Create a tar.gz archive from a list of files using pure Node.js (no shell).
 * Uses the USTAR tar format with gzip compression.
 */
function createTarGzBuffer(rootDir: string, files: string[]): Buffer {
  const chunks: Buffer[] = [];

  for (const relPath of files) {
    const fullPath = path.join(rootDir, relPath);
    if (!existsSync(fullPath)) continue;

    const stat = statSync(fullPath);
    if (!stat.isFile()) continue;

    const content = readFileSync(fullPath);

    // Create tar header (512 bytes)
    const header = Buffer.alloc(512);
    // name (100 bytes)
    header.write(relPath.slice(0, 100), 0, 100, "utf-8");
    // mode (8 bytes)
    header.write("0000644\0", 100, 8, "utf-8");
    // uid (8 bytes)
    header.write("0001000\0", 108, 8, "utf-8");
    // gid (8 bytes)
    header.write("0001000\0", 116, 8, "utf-8");
    // size (12 bytes, octal)
    header.write(stat.size.toString(8).padStart(11, "0") + "\0", 124, 12, "utf-8");
    // mtime (12 bytes, octal)
    const mtime = Math.floor(stat.mtimeMs / 1000);
    header.write(mtime.toString(8).padStart(11, "0") + "\0", 136, 12, "utf-8");
    // checksum placeholder (8 bytes of spaces)
    header.write("        ", 148, 8, "utf-8");
    // typeflag: regular file
    header.write("0", 156, 1, "utf-8");
    // magic
    header.write("ustar\0", 257, 6, "utf-8");
    // version
    header.write("00", 263, 2, "utf-8");

    // Calculate checksum
    let checksum = 0;
    for (let i = 0; i < 512; i++) {
      checksum += header[i];
    }
    header.write(checksum.toString(8).padStart(6, "0") + "\0 ", 148, 8, "utf-8");

    chunks.push(header);
    chunks.push(content);

    // Pad to 512-byte boundary
    const remainder = content.length % 512;
    if (remainder > 0) {
      chunks.push(Buffer.alloc(512 - remainder));
    }
  }

  // End-of-archive: two 512-byte blocks of zeros
  chunks.push(Buffer.alloc(1024));

  const tarBuffer = Buffer.concat(chunks);

  // Gzip compress synchronously
  const { gzipSync } = require("zlib");
  return gzipSync(tarBuffer);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const auth = await checkAdmin(request);
    if ("error" in auth) return auth.error;

    switch (type) {
      case "source-code":
        return handleSourceCode();
      case "db-schema":
        return await handleDbSchema();
      case "seed-data":
        return handleSeedData();
      case "docs":
        return handleDocs();
      case "doc-file":
        return handleDocFile(request);
      case "env-template":
        return handleEnvTemplate();
      case "docker-compose":
        return handleDockerCompose();
      case "dockerfile":
        return handleDockerfile();
      default:
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: `Unknown download type: ${type}` } },
          { status: 404 }
        );
    }
  } catch (error) {
    console.error("GET /api/v1/admin/downloads/[type] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

function handleSourceCode() {
  const dirs = ["src/", "drizzle/"];
  const singleFiles = [
    "package.json",
    "tsconfig.json",
    "next.config.ts",
    "drizzle.config.ts",
    "tailwind.config.ts",
    "postcss.config.mjs",
  ];

  const allFiles: string[] = [];

  // Collect files from directories
  for (const dir of dirs) {
    const fullDir = path.join(PROJECT_ROOT, dir);
    if (existsSync(fullDir)) {
      allFiles.push(...collectFiles(fullDir, dir));
    }
  }

  // Add single files
  for (const f of singleFiles) {
    if (existsSync(path.join(PROJECT_ROOT, f))) {
      allFiles.push(f);
    }
  }

  const buffer = createTarGzBuffer(PROJECT_ROOT, allFiles);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/gzip",
      "Content-Disposition": `attachment; filename="cs-erp-source.tar.gz"`,
      "Content-Length": String(buffer.length),
    },
  });
}

async function handleDbSchema() {
  try {
    // Query information_schema for table and column definitions (no shell, no pg_dump)
    const columns = await db.execute(sql`
      SELECT
        c.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        c.character_maximum_length,
        c.udt_name
      FROM information_schema.columns c
      JOIN information_schema.tables t
        ON c.table_name = t.table_name AND c.table_schema = t.table_schema
      WHERE c.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
      ORDER BY c.table_name, c.ordinal_position
    `);

    // Build SQL DDL from information_schema
    const tableMap = new Map<string, Array<Record<string, unknown>>>();
    for (const row of columns) {
      const tableName = row.table_name as string;
      if (!tableMap.has(tableName)) tableMap.set(tableName, []);
      tableMap.get(tableName)!.push(row);
    }

    // Get indexes
    const indexes = await db.execute(sql`
      SELECT
        indexname,
        tablename,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);

    // Get constraints
    const constraints = await db.execute(sql`
      SELECT
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
      WHERE tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_name
    `);

    let schemaSql = "-- CS-ERP Database Schema (generated from information_schema)\n";
    schemaSql += `-- Generated at: ${new Date().toISOString()}\n\n`;

    for (const [tableName, cols] of tableMap) {
      schemaSql += `CREATE TABLE ${tableName} (\n`;
      const colDefs = cols.map((col) => {
        let def = `  ${col.column_name} ${col.udt_name}`;
        if (col.character_maximum_length) def += `(${col.character_maximum_length})`;
        if (col.is_nullable === "NO") def += " NOT NULL";
        if (col.column_default) def += ` DEFAULT ${col.column_default}`;
        return def;
      });
      schemaSql += colDefs.join(",\n");
      schemaSql += "\n);\n\n";
    }

    // Add indexes
    schemaSql += "-- Indexes\n";
    for (const idx of indexes) {
      schemaSql += `${idx.indexdef};\n`;
    }
    schemaSql += "\n";

    // Add constraints summary
    schemaSql += "-- Constraints\n";
    for (const con of constraints) {
      if (con.constraint_type === "FOREIGN KEY") {
        schemaSql += `-- FK: ${con.table_name}.${con.column_name} -> ${con.foreign_table_name}.${con.foreign_column_name}\n`;
      }
    }

    return sqlResponse(schemaSql, "cs-erp-schema.sql");
  } catch {
    // Fallback: collect migration files
    const drizzleDir = path.join(PROJECT_ROOT, "drizzle");
    if (!existsSync(drizzleDir)) {
      return sqlResponse("-- No schema files available\n", "cs-erp-schema.sql");
    }
    const sqlFiles = readdirSync(drizzleDir)
      .filter((f: string) => f.endsWith(".sql"))
      .sort();
    const combined = sqlFiles
      .map((f: string) => {
        const content = readFileSync(path.join(drizzleDir, f), "utf-8");
        return `-- Migration: ${f}\n${content}\n`;
      })
      .join("\n");
    return sqlResponse(combined, "cs-erp-schema.sql");
  }
}

function handleSeedData() {
  const scriptsDir = path.join(PROJECT_ROOT, "scripts");
  const seedFiles: string[] = [];

  if (existsSync(scriptsDir)) {
    const files = readdirSync(scriptsDir).filter((f: string) =>
      f.startsWith("seed") && f.endsWith(".sql")
    );
    seedFiles.push(...files.map((f: string) => path.join(scriptsDir, f)));
  }

  // Also check /tmp for seed files
  try {
    const tmpFiles = readdirSync("/tmp").filter(
      (f: string) => f.startsWith("seed") && f.endsWith(".sql")
    );
    seedFiles.push(...tmpFiles.map((f: string) => path.join("/tmp", f)));
  } catch {
    // /tmp not readable, skip
  }

  if (seedFiles.length === 0) {
    return sqlResponse("-- No seed data files found\n", "cs-erp-seed-data.sql");
  }

  const combined = seedFiles
    .map((f) => {
      const content = readFileSync(f, "utf-8");
      const name = path.basename(f);
      return `-- Seed file: ${name}\n${content}\n`;
    })
    .join("\n");

  return sqlResponse(combined, "cs-erp-seed-data.sql");
}

function handleDocs() {
  const docsDir = path.join(PROJECT_ROOT, "docs");
  if (!existsSync(docsDir)) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Documentation directory not found" } },
      { status: 404 }
    );
  }

  const files = collectFiles(docsDir, "docs/");
  const buffer = createTarGzBuffer(PROJECT_ROOT, files);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/gzip",
      "Content-Disposition": `attachment; filename="cs-erp-docs.tar.gz"`,
      "Content-Length": String(buffer.length),
    },
  });
}

function handleDocFile(request: NextRequest) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name");
  if (!name || name.includes("..") || name.includes("/")) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid file name" } },
      { status: 400 }
    );
  }

  const filePath = path.join(PROJECT_ROOT, "docs", name);
  if (!existsSync(filePath)) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: `Document not found: ${name}` } },
      { status: 404 }
    );
  }

  const content = readFileSync(filePath, "utf-8");
  return textResponse(content, name, "text/markdown");
}

function handleEnvTemplate() {
  const envTemplate = `# CS ERP Environment Configuration
# Copy this file to .env.local and fill in the values

# ==========================================
# Database
# ==========================================
DATABASE_URL=postgresql://user:password@localhost:5432/cs_erp
DIRECT_DATABASE_URL=postgresql://user:password@localhost:5432/cs_erp

# ==========================================
# Authentication (RS256 JWT)
# ==========================================
JWT_PRIVATE_KEY_PATH=./.keys/private.pem
JWT_PUBLIC_KEY_PATH=./.keys/public.pem
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=30d

# ==========================================
# Redis
# ==========================================
REDIS_URL=redis://localhost:6379

# ==========================================
# Application
# ==========================================
NEXT_PUBLIC_APP_URL=http://localhost:3100
NODE_ENV=development
PORT=3100

# ==========================================
# Email (SMTP)
# ==========================================
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@example.com

# ==========================================
# File Storage
# ==========================================
STORAGE_PROVIDER=local
STORAGE_PATH=./uploads
# For S3:
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_S3_BUCKET=
# AWS_REGION=

# ==========================================
# AI Providers (optional)
# ==========================================
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GOOGLE_AI_API_KEY=

# ==========================================
# Monitoring (optional)
# ==========================================
SENTRY_DSN=
LOG_LEVEL=info
`;

  return textResponse(envTemplate, ".env.example");
}

function handleDockerCompose() {
  const compose = `version: "3.8"

services:
  cs-erp-web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3100:3100"
    environment:
      - DATABASE_URL=postgresql://cs_erp_user:changeme@postgres:5432/cs_erp
      - REDIS_URL=redis://redis:6379
      - NODE_ENV=production
      - PORT=3100
    volumes:
      - ./.keys:/app/.keys:ro
      - ./uploads:/app/uploads
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: cs_erp_user
      POSTGRES_PASSWORD: changeme
      POSTGRES_DB: cs_erp
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cs_erp_user -d cs_erp"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    restart: unless-stopped

volumes:
  pgdata:
  redisdata:
`;

  return textResponse(compose, "docker-compose.yml", "application/yaml");
}

function handleDockerfile() {
  const dockerfilePath = path.join(PROJECT_ROOT, "Dockerfile");
  if (!existsSync(dockerfilePath)) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Dockerfile not found" } },
      { status: 404 }
    );
  }

  const content = readFileSync(dockerfilePath, "utf-8");
  return textResponse(content, "Dockerfile");
}
