import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { Download, FileCode, Database, BookOpen, Settings, Rocket } from "lucide-react";

const DOCS = [
  { file: "architecture.md", label: "System Architecture" },
  { file: "modules-reference.md", label: "Modules Reference" },
  { file: "api-reference.md", label: "API Reference" },
  { file: "database-schema.md", label: "Database Schema" },
  { file: "user-guide.md", label: "User Guide" },
  { file: "ai-agents-guide.md", label: "AI Agents Guide" },
  { file: "operational-processes.md", label: "Operational Processes" },
  { file: "admin-guide.md", label: "Admin Guide" },
  { file: "deployment-guide.md", label: "Deployment Guide" },
  { file: "data-dictionary.md", label: "Data Dictionary" },
  { file: "integration-guide.md", label: "Integration Guide" },
  { file: "release-notes.md", label: "Release Notes" },
  { file: "local-development-setup.md", label: "Local Dev Setup" },
];

function DownloadButton({ href, label, variant = "primary" }: { href: string; label: string; variant?: "primary" | "secondary" }) {
  const cls = variant === "primary"
    ? "inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
    : "inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50";
  return (
    <a href={href} className={cls}>
      <Download className={variant === "primary" ? "h-4 w-4" : "h-3 w-3"} />
      {label}
    </a>
  );
}

export default async function AdminDownloadsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:read"))) redirect("/");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Downloads</h1>
        <p className="text-sm text-gray-500">Download source code, documentation, and configuration files</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Source Code */}
        <div className="rounded-lg border bg-white p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
              <FileCode className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Source Code</h2>
              <p className="text-sm text-gray-500">Full source code with all 61 modules</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <DownloadButton href="/api/v1/admin/downloads/source-code" label="Download Source (TAR.GZ)" />
          </div>
        </div>

        {/* Database */}
        <div className="rounded-lg border bg-white p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Database</h2>
              <p className="text-sm text-gray-500">Schema (524 tables) and seed data for all modules</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <DownloadButton href="/api/v1/admin/downloads/db-schema" label="Download Schema SQL" />
            <DownloadButton href="/api/v1/admin/downloads/seed-data" label="Download Seed SQL" />
          </div>
        </div>

        {/* Documentation */}
        <div className="rounded-lg border bg-white p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Documentation</h2>
              <p className="text-sm text-gray-500">13 comprehensive guides</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <DownloadButton href="/api/v1/admin/downloads/docs" label="Download All Docs (TAR.GZ)" />
          </div>
          <div className="border-t pt-3 space-y-1">
            {DOCS.map((d) => (
              <a key={d.file} href={`/api/v1/admin/downloads/doc-file?name=${d.file}`} className="flex items-center gap-2 rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 hover:underline">
                <Download className="h-3 w-3" /> {d.label}
              </a>
            ))}
          </div>
        </div>

        {/* Configuration */}
        <div className="rounded-lg border bg-white p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
              <p className="text-sm text-gray-500">Everything needed to run locally</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <DownloadButton href="/api/v1/admin/downloads/docker-compose" label="Docker Compose" variant="secondary" />
            <DownloadButton href="/api/v1/admin/downloads/env-template" label="Env Template" variant="secondary" />
            <DownloadButton href="/api/v1/admin/downloads/dockerfile" label="Dockerfile" variant="secondary" />
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="rounded-lg border bg-white p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gray-100 p-2.5 text-gray-600">
            <Rocket className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Quick Start Guide</h2>
        </div>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Download source code and extract</li>
          <li>Copy <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">.env.example</code> to <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">.env.local</code> and fill in values</li>
          <li>Run <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">npm install</code></li>
          <li>Set up PostgreSQL and run schema migration</li>
          <li>Run seed data SQL</li>
          <li>Run <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">npm run dev</code></li>
          <li>Open <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">http://localhost:3100</code></li>
        </ol>
      </div>
    </div>
  );
}
