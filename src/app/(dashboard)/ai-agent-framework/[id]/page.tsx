import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import {
  aafAgents,
  aafAgentRuns,
  aafEscalations,
  aafDocumentProcessingJobs,
  aafWorkflowInstances,
  aafOrchestrationTasks,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "runs", label: "Runs" },
  { key: "escalations", label: "Escalations" },
  { key: "documents", label: "Documents" },
  { key: "workflows", label: "Workflows" },
  { key: "orchestration", label: "Orchestration" },
] as const;

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

export default async function AgentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ai:read")))
    redirect("/ai-agent-framework");

  const { id } = await params;
  const sp = await searchParams;
  const activeTab = sp.tab ?? "overview";

  const record = await db
    .select()
    .from(aafAgents)
    .where(
      and(
        eq(aafAgents.id, id),
        eq(aafAgents.tenantId, session.tenantId),
        isNull(aafAgents.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "ai:edit");
  const canDelete = await hasPermission(session.id, session.tenantId, "ai:delete");

  const tenantFilter = session.tenantId;
  const [runs, escalations, docJobs, workflows, orchTasks] = await Promise.all([
    db.select().from(aafAgentRuns).where(and(eq(aafAgentRuns.tenantId, tenantFilter), eq(aafAgentRuns.agentId, id), isNull(aafAgentRuns.deletedAt))).orderBy(desc(aafAgentRuns.createdAt)).limit(50),
    db.select().from(aafEscalations).where(and(eq(aafEscalations.tenantId, tenantFilter), eq(aafEscalations.agentId, id), isNull(aafEscalations.deletedAt))).orderBy(desc(aafEscalations.createdAt)).limit(50),
    db.select().from(aafDocumentProcessingJobs).where(and(eq(aafDocumentProcessingJobs.tenantId, tenantFilter), eq(aafDocumentProcessingJobs.agentId, id), isNull(aafDocumentProcessingJobs.deletedAt))).orderBy(desc(aafDocumentProcessingJobs.createdAt)).limit(50),
    db.select().from(aafWorkflowInstances).where(and(eq(aafWorkflowInstances.tenantId, tenantFilter), isNull(aafWorkflowInstances.deletedAt))).orderBy(desc(aafWorkflowInstances.createdAt)).limit(50),
    db.select().from(aafOrchestrationTasks).where(and(eq(aafOrchestrationTasks.tenantId, tenantFilter), isNull(aafOrchestrationTasks.deletedAt))).orderBy(desc(aafOrchestrationTasks.createdAt)).limit(50),
  ]);

  const tabData: Record<string, { headers: string[]; rows: string[][] }> = {
    runs: {
      headers: ["Run Number", "Trigger", "Status", "Priority", "Tokens", "Duration", "Started"],
      rows: runs.map((r) => [r.runNumber, r.triggerType, r.status, r.priority, r.tokensUsed?.toString() ?? "-", r.durationMs ? `${r.durationMs}ms` : "-", fmtDate(r.startedAt)]),
    },
    escalations: {
      headers: ["Reference", "Source", "Severity", "Priority", "Status", "Reason", "Created"],
      rows: escalations.map((e) => [e.escalationRef, e.sourceType, e.severity, e.priority, e.status, (e.reason ?? "").slice(0, 40), fmtDate(e.createdAt)]),
    },
    documents: {
      headers: ["Job Ref", "Doc Type", "Job Type", "Status", "Confidence", "OCR Engine", "Created"],
      rows: docJobs.map((d) => [d.jobReference, d.documentType, d.jobType, d.status, d.confidenceScore?.toString() ?? "-", d.ocrEngine ?? "-", fmtDate(d.createdAt)]),
    },
    workflows: {
      headers: ["Instance Ref", "Status", "Step", "Started", "Completed", "Duration"],
      rows: workflows.map((w) => [w.instanceRef, w.status, `${w.currentStep}/${w.totalSteps}`, fmtDate(w.startedAt), fmtDate(w.completedAt), w.durationMs ? `${w.durationMs}ms` : "-"]),
    },
    orchestration: {
      headers: ["Task Code", "Name", "Strategy", "Status", "Step", "Started", "Duration"],
      rows: orchTasks.map((o) => [o.taskCode, o.taskName, o.strategy, o.status, `${o.currentStep}/${o.totalSteps}`, fmtDate(o.startedAt), o.durationMs ? `${o.durationMs}ms` : "-"]),
    },
  };

  const currentTab = tabData[activeTab];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/ai-agent-framework" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{record.agentName}</h1>
          <p className="text-sm text-gray-500">{record.agentCode} &middot; {record.agentType}</p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link href={`/ai-agent-framework/${id}/edit`} className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          )}
          {canDelete && (
            <form action={`/api/v1/ai-agent-framework/agents/${id}`} method="POST">
              <button type="submit" className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border bg-gray-50 p-1">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/ai-agent-framework/${id}?tab=${tab.key}`}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" ? (
        <div className="rounded-lg border bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Agent Name", value: record.agentName },
              { label: "Agent Code", value: record.agentCode },
              { label: "Agent Type", value: record.agentType },
              { label: "Model Provider", value: record.modelProvider ?? "-" },
              { label: "Model ID", value: record.modelId ?? "-" },
              { label: "Endpoint", value: record.endpoint ?? "-" },
              { label: "Max Concurrency", value: record.maxConcurrency?.toString() ?? "1" },
              { label: "Timeout", value: record.timeoutMs ? `${record.timeoutMs}ms` : "30000ms" },
              { label: "Last Active", value: fmtDate(record.lastActiveAt) },
            ].map((field) => (
              <div key={field.label}>
                <p className="text-xs font-medium text-gray-500">{field.label}</p>
                <p className="mt-0.5 text-sm text-gray-900">{field.value}</p>
              </div>
            ))}
            <div>
              <p className="text-xs font-medium text-gray-500">Active</p>
              <div className="mt-0.5">
                <Badge variant={record.isActive ? "success" : "secondary"}>
                  {record.isActive ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Status</p>
              <div className="mt-0.5">
                <Badge variant={record.status === "running" ? "success" : record.status === "error" ? "destructive" : "secondary"}>
                  {record.status}
                </Badge>
              </div>
            </div>
          </div>
          {record.description && (
            <div className="mt-6 border-t pt-4">
              <p className="text-xs font-medium text-gray-500">Description</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.description}</p>
            </div>
          )}
          {record.notes && (
            <div className="mt-4 border-t pt-4">
              <p className="text-xs font-medium text-gray-500">Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.notes}</p>
            </div>
          )}
        </div>
      ) : currentTab ? (
        currentTab.rows.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <p className="text-gray-500">No records found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  {currentTab.headers.map((h) => (
                    <th key={h} className="px-4 py-3 text-start font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentTab.rows.map((row, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-3 text-gray-600">
                        {j === row.length - 1 || (currentTab.headers[j] ?? "").toLowerCase().includes("status") ? (
                          <Badge variant="secondary">{String(cell).replace(/_/g, " ")}</Badge>
                        ) : (
                          String(cell)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </div>
  );
}
