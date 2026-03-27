"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Loader2,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Activity,
  Clock,
  Package,
} from "lucide-react";

// ── Types ──

interface FlowInstance {
  id: string;
  e2eFlowId: string;
  entityType: string;
  entityId: string;
  triggerEvent: string;
  status: string;
  currentStepNumber: number;
  totalSteps: number;
  parentFlowInstanceId: string | null;
  metadata: Record<string, unknown> | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
}

// ── Config ──

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; icon: typeof Activity }> = {
  active: { bg: "bg-blue-100 dark:bg-blue-900/50", text: "text-blue-700 dark:text-blue-300", label: "Active", icon: Activity },
  paused_at_gate: { bg: "bg-amber-100 dark:bg-amber-900/50", text: "text-amber-700 dark:text-amber-300", label: "At Gate", icon: Pause },
  completed: { bg: "bg-emerald-100 dark:bg-emerald-900/50", text: "text-emerald-700 dark:text-emerald-300", label: "Completed", icon: CheckCircle },
  failed: { bg: "bg-rose-100 dark:bg-rose-900/50", text: "text-rose-700 dark:text-rose-300", label: "Failed", icon: XCircle },
  cancelled: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400", label: "Cancelled", icon: XCircle },
};

const ENTITY_TYPES = [
  "booking",
  "vessel",
  "container",
  "invoice",
  "bill_of_lading",
  "purchase_order",
  "crew_member",
  "charter_party",
  "insurance_claim",
  "customs_filing",
];

// ── Helpers ──

function formatDuration(startStr: string | null, endStr: string | null): string {
  if (!startStr) return "\u2014";
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : new Date();
  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 60000) return `${Math.round(diffMs / 1000)}s`;
  if (diffMs < 3600000) return `${Math.round(diffMs / 60000)}m`;
  const hours = Math.floor(diffMs / 3600000);
  const mins = Math.round((diffMs % 3600000) / 60000);
  return `${hours}h ${mins}m`;
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getFlowName(metadata: Record<string, unknown> | null, flowId: string): string {
  if (metadata && typeof metadata.flowName === "string") return metadata.flowName;
  return flowId;
}

// ── Component ──

export default function TransactionProcessViewPage() {
  const searchParams = useSearchParams();
  const initialEntityType = searchParams.get("entityType") ?? "";
  const initialEntityId = searchParams.get("entityId") ?? "";

  const [entityType, setEntityType] = useState(initialEntityType);
  const [entityId, setEntityId] = useState(initialEntityId);
  const [searchType, setSearchType] = useState(initialEntityType);
  const [searchId, setSearchId] = useState(initialEntityId);
  const [flows, setFlows] = useState<FlowInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(!!initialEntityType && !!initialEntityId);

  const fetchFlows = useCallback(async (eType: string, eId: string) => {
    if (!eType || !eId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        entityType: eType,
        entityId: eId,
        limit: "50",
      });
      const res = await fetch(`/api/v1/process-engine/e2e-flows?${params.toString()}`, { credentials: "include" });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) {
        setError("Failed to load flows");
        return;
      }
      const body = await res.json();
      setFlows(body.data ?? []);
      setSearched(true);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialEntityType && initialEntityId) {
      fetchFlows(initialEntityType, initialEntityId);
    }
  }, [initialEntityType, initialEntityId, fetchFlows]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setEntityType(searchType);
    setEntityId(searchId);
    fetchFlows(searchType, searchId);
  };

  // Group flows by status
  const active = flows.filter((f) => f.status === "active" || f.status === "paused_at_gate");
  const completed = flows.filter((f) => f.status === "completed");
  const other = flows.filter((f) => f.status !== "active" && f.status !== "paused_at_gate" && f.status !== "completed");

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-1">
        <Link href="/e2e-flows" className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400">
          <ArrowLeft className="h-4 w-4" /> Back to E2E Flows
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <Package className="h-6 w-6 text-blue-500" />
          Transaction Process View
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          View all E2E flows associated with a specific entity
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Entity Type</label>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 focus:border-blue-500 focus:outline-none"
            required
          >
            <option value="">Select type...</option>
            {ENTITY_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Entity ID</label>
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="e.g. BKG-2024-001 or UUID"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || !searchType || !searchId}
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-950">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          <p className="text-sm text-rose-800 dark:text-rose-200">{error}</p>
        </div>
      )}

      {/* Results */}
      {searched && !loading && !error && (
        <>
          {/* Summary */}
          {entityType && entityId && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing flows for <span className="font-medium text-gray-900 dark:text-white">{entityType}</span>
                    {" / "}
                    <span className="font-mono text-gray-900 dark:text-white">{entityId}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">{flows.length} total</span>
                  {active.length > 0 && (
                    <span className="font-medium text-blue-600">{active.length} active</span>
                  )}
                  {completed.length > 0 && (
                    <span className="font-medium text-emerald-600">{completed.length} completed</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Empty */}
          {flows.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white px-8 py-16 text-center dark:border-gray-700 dark:bg-gray-900">
              <GitBranch className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">No flows found</p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                No E2E flows have been created for this entity yet.
              </p>
            </div>
          )}

          {/* Active Flows */}
          {active.length > 0 && (
            <FlowSection title="Active Flows" flows={active} />
          )}

          {/* Completed Flows */}
          {completed.length > 0 && (
            <FlowSection title="Completed Flows" flows={completed} />
          )}

          {/* Other (failed/cancelled) */}
          {other.length > 0 && (
            <FlowSection title="Other Flows" flows={other} />
          )}
        </>
      )}

      {/* Initial state */}
      {!searched && !loading && (
        <div className="rounded-lg border border-gray-200 bg-white px-8 py-16 text-center dark:border-gray-700 dark:bg-gray-900">
          <Search className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
            Search for an entity to view its process flows
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Select an entity type and enter its ID to see all associated E2E flows.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Flow Section ──

function FlowSection({ title, flows }: { title: string; flows: FlowInstance[] }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      <div className="space-y-2">
        {flows.map((flow) => {
          const statusConf = STATUS_CONFIG[flow.status] ?? STATUS_CONFIG.active;
          const StatusIcon = statusConf.icon;
          const pct = flow.totalSteps > 0 ? Math.round((flow.currentStepNumber / flow.totalSteps) * 100) : 0;

          return (
            <Link
              key={flow.id}
              href={`/e2e-flows/${flow.id}`}
              className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800/50"
            >
              <StatusIcon className={`h-5 w-5 shrink-0 ${statusConf.text}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {getFlowName(flow.metadata, flow.e2eFlowId)}
                </p>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-mono">{flow.e2eFlowId}</span>
                  <span>{flow.triggerEvent}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(flow.startedAt)}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full rounded-full ${
                      flow.status === "completed" ? "bg-emerald-500" :
                      flow.status === "failed" ? "bg-rose-500" :
                      flow.status === "paused_at_gate" ? "bg-amber-500" :
                      "bg-blue-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs tabular-nums text-gray-500">{flow.currentStepNumber}/{flow.totalSteps}</span>
              </div>

              {/* Status Badge */}
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConf.bg} ${statusConf.text}`}>
                {statusConf.label}
              </span>

              {/* Duration */}
              <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">
                {formatDuration(flow.startedAt, flow.completedAt)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
