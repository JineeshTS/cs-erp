import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { execSync } from "child_process";
import { readFileSync, existsSync, readdirSync } from "fs";
import path from "path";

const PROJECT_ROOT = process.cwd();

async function checkAdmin(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return { error: unauthorizedResponse() };
  if (!(await hasPermission(user.id, user.tenantId, "admin:read"))) {
    return { error: forbiddenResponse() };
  }
  return { user };
}

function tarResponse(buffer: Buffer, filename: string) {
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/gzip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(buffer.length),
    },
  });
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
        return handleDbSchema();
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
  const files = [
    "src/",
    "package.json",
    "tsconfig.json",
    "next.config.ts",
    "drizzle.config.ts",
    "drizzle/",
    "tailwind.config.ts",
    "postcss.config.mjs",
  ].filter((f) => existsSync(path.join(PROJECT_ROOT, f)));

  const buffer = execSync(
    `tar czf - ${files.join(" ")}`,
    { cwd: PROJECT_ROOT, maxBuffer: 200 * 1024 * 1024 }
  );

  return tarResponse(buffer, "cs-erp-source.tar.gz");
}

function handleDbSchema() {
  const dbUrl = process.env.DATABASE_URL || "";
  const match = dbUrl.match(
    /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/
  );

  if (!match) {
    return sqlResponse(
      "-- DATABASE_URL not configured for schema export\n",
      "cs-erp-schema.sql"
    );
  }

  const [, user, password, host, port, database] = match;

  try {
    const schema = execSync(
      `PGPASSWORD=${password} pg_dump --schema-only -h ${host} -p ${port} -U ${user} ${database}`,
      { maxBuffer: 50 * 1024 * 1024 }
    ).toString();
    return sqlResponse(schema, "cs-erp-schema.sql");
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

  const buffer = execSync(`tar czf - docs/`, {
    cwd: PROJECT_ROOT,
    maxBuffer: 50 * 1024 * 1024,
  });

  return tarResponse(buffer, "cs-erp-docs.tar.gz");
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
      - DATABASE_URL=postgresql://codilla:changeme@postgres:5432/cs_erp
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
      POSTGRES_USER: codilla
      POSTGRES_PASSWORD: changeme
      POSTGRES_DB: cs_erp
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U codilla -d cs_erp"]
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
