"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Zap,
  ShieldAlert,
  GitBranch,
} from "lucide-react";

// ── Types ──

interface FlowDashboardStats {
  total: number;
  active: number;
  pausedAtGate: number;
  completed: number;
  failed: number;
  cancelled: number;
  pendingGates: number;
}

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

interface GateStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  autoApproved: number;
  breached: number;
  avgResponseMinutes: number;
  byType: Array<{ gateType: string; count: number; pending: number }>;
}

// ── Status Configuration ──

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-blue-100 dark:bg-blue-900/50", text: "text-blue-700 dark:text-blue-300", label: "Active" },
  paused_at_gate: { bg: "bg-amber-100 dark:bg-amber-900/50", text: "text-amber-700 dark:text-amber-300", label: "At Gate" },
  completed: { bg: "bg-emerald-100 dark:bg-emerald-900/50", text: "text-emerald-700 dark:text-emerald-300", label: "Completed" },
  failed: { bg: "bg-rose-100 dark:bg-rose-900/50", text: "text-rose-700 dark:text-rose-300", label: "Failed" },
  cancelled: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400", label: "Cancelled" },
};

const GATE_TYPE_COLORS: Record<string, string> = {
  approval: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
  decision: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  input: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  exception: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

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

function formatRelative(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function getFlowName(metadata: Record<string, unknown> | null, flowId: string): string {
  if (metadata && typeof metadata.flowName === "string") return metadata.flowName;
  return flowId;
}

// ── Component ──

export default function E2EFlowMonitorPage() {
  const [stats, setStats] = useState<FlowDashboardStats | null>(null);
  const [gateStats, setGateStats] = useState<GateStats | null>(null);
  const [instances, setInstances] = useState<FlowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<"flows" | "gates">("flows");

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (statusFilter) params.set("status", statusFilter);

      const [statsRes, instancesRes, gateStatsRes] = await Promise.all([
        fetch("/api/v1/process-engine/e2e-flows?dashboard=true"),
        fetch(`/api/v1/process-engine/e2e-flows?${params.toString()}`),
        fetch("/api/v1/process-engine/human-gates/stats"),
      ]);

      if (statsRes.status === 401 || instancesRes.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!statsRes.ok || !instancesRes.ok) {
        setError("Failed to load flow data");
        return;
      }

      const [statsBody, instancesBody] = await Promise.all([
        statsRes.json(),
        instancesRes.json(),
      ]);

      setStats(statsBody.data);
      setInstances(instancesBody.data ?? []);

      if (gateStatsRes.ok) {
        const gateBody = await gateStatsRes.json();
        setGateStats(gateBody.data);
      }

      setError(null);
      setLastRefresh(new Date());
    } catch {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    setLoading(true);
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── Stat Cards ──

  const flowStatCards = stats
    ? [
        { label: "Total Flows", value: stats.total, icon: GitBranch, color: "text-slate-600 dark:text-slate-400" },
        { label: "Active", value: stats.active, icon: Zap, color: "text-blue-600 dark:text-blue-400" },
        { label: "At Gate", value: stats.pausedAtGate, icon: Pause, color: "text-amber-600 dark:text-amber-400" },
        { label: "Pending Gates", value: stats.pendingGates, icon: ShieldAlert, color: "text-orange-600 dark:text-orange-400" },
        { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400" },
        { label: "Failed", value: stats.failed, icon: XCircle, color: "text-rose-600 dark:text-rose-400" },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">E2E Flow Monitor</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Live view of all end-to-end flow instances and human gates — auto-refreshes every 10s
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Updated {formatRelative(lastRefresh.toISOString())}
          </span>
          <button
            onClick={() => { setLoading(true); fetchData(); }}
            className="rounded-md border border-slate-200 dark:border-slate-700 p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {flowStatCards.map((s) => (
            <div key={s.label} className="rounded-lg border border-slate-200/60 bg-white dark:border-slate-700/60 dark:bg-slate-900 p-4">
              <div className="flex items-center gap-2">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span className="text-xs text-slate-500 dark:text-slate-400">{s.label}</span>
              </div>
              <p className={`mt-1 text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("flows")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "flows"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          Flow Instances
        </button>
        <button
          onClick={() => setActiveTab("gates")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "gates"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          Human Gates
          {stats && stats.pendingGates > 0 && (
            <span className="ms-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              {stats.pendingGates}
            </span>
          )}
        </button>
      </div>

      {/* ── Flows Tab ── */}
      {activeTab === "flows" && (
        <>
          {/* Filter */}
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-slate-300 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="paused_at_gate">At Gate</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {instances.length} flow{instances.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950 p-4">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              <p className="text-sm text-rose-800 dark:text-rose-200">{error}</p>
              <button
                onClick={() => { setError(null); setLoading(true); fetchData(); }}
                className="ms-auto text-xs font-medium text-rose-600 hover:text-rose-800 dark:text-rose-400"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && !instances.length && (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && instances.length === 0 && !error && (
            <div className="rounded-lg border border-slate-200/60 bg-white dark:border-slate-700/60 dark:bg-slate-900 px-8 py-16 text-center">
              <GitBranch className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">No E2E flow instances found</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Flows are created automatically when business events occur, or manually from the{" "}
                <Link href="/processes" className="text-blue-600 hover:underline dark:text-blue-400">Process Hub</Link>.
              </p>
            </div>
          )}

          {/* Flow Table */}
          {instances.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-slate-200/60 bg-white dark:border-slate-700/60 dark:bg-slate-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Flow</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Status</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Progress</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Trigger</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Entity</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Started</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {instances.map((inst) => {
                    const statusCfg = STATUS_CONFIG[inst.status] ?? STATUS_CONFIG.active;
                    const pct = inst.totalSteps > 0 ? Math.round((inst.currentStepNumber / inst.totalSteps) * 100) : 0;
                    const flowName = getFlowName(inst.metadata, inst.e2eFlowId);
                    return (
                      <tr
                        key={inst.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[220px]">{flowName}</div>
                          <div className="text-xs text-slate-400 font-mono">{inst.e2eFlowId}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  inst.status === "completed" ? "bg-emerald-500" :
                                  inst.status === "failed" ? "bg-rose-500" :
                                  inst.status === "paused_at_gate" ? "bg-amber-500" :
                                  "bg-blue-500"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 tabular-nums">{inst.currentStepNumber}/{inst.totalSteps}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-500 dark:text-slate-400">{inst.triggerEvent}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {inst.entityType} {inst.entityId.length > 12 ? `${inst.entityId.slice(0, 12)}\u2026` : inst.entityId}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                            {formatRelative(inst.startedAt)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                            {formatDuration(inst.startedAt, inst.completedAt)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Gates Tab ── */}
      {activeTab === "gates" && (
        <>
          {/* Gate Stats Cards */}
          {gateStats && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-slate-200/60 bg-white dark:border-slate-700/60 dark:bg-slate-900 p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Pending</span>
                </div>
                <p className="mt-1 text-xl font-bold text-amber-600 dark:text-amber-400">{gateStats.pending}</p>
              </div>
              <div className="rounded-lg border border-slate-200/60 bg-white dark:border-slate-700/60 dark:bg-slate-900 p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">SLA Breached</span>
                </div>
                <p className="mt-1 text-xl font-bold text-rose-600 dark:text-rose-400">{gateStats.breached}</p>
              </div>
              <div className="rounded-lg border border-slate-200/60 bg-white dark:border-slate-700/60 dark:bg-slate-900 p-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Auto-Approved</span>
                </div>
                <p className="mt-1 text-xl font-bold text-purple-600 dark:text-purple-400">{gateStats.autoApproved}</p>
              </div>
              <div className="rounded-lg border border-slate-200/60 bg-white dark:border-slate-700/60 dark:bg-slate-900 p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Avg Response</span>
                </div>
                <p className="mt-1 text-xl font-bold text-slate-600 dark:text-slate-400">{gateStats.avgResponseMinutes}m</p>
              </div>
            </div>
          )}

          {/* Gate Type Breakdown */}
          {gateStats && gateStats.byType.length > 0 && (
            <div className="rounded-lg border border-slate-200/60 bg-white dark:border-slate-700/60 dark:bg-slate-900 p-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Gates by Type</h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {gateStats.byType.map((gt) => (
                  <div key={gt.gateType} className="flex items-center justify-between rounded-md bg-slate-50 dark:bg-slate-800 px-3 py-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${GATE_TYPE_COLORS[gt.gateType] ?? "bg-slate-100 text-slate-700"}`}>
                      {gt.gateType}
                    </span>
                    <div className="text-end">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{gt.count}</span>
                      {gt.pending > 0 && (
                        <span className="ms-1 text-xs text-amber-600 dark:text-amber-400">({gt.pending} pending)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gate Summary */}
          {gateStats && (
            <div className="rounded-lg border border-slate-200/60 bg-white dark:border-slate-700/60 dark:bg-slate-900 p-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Gate Resolution Summary</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{gateStats.approved}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Approved</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{gateStats.rejected}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Rejected</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">{gateStats.total}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty Gate State */}
          {!loading && (!gateStats || gateStats.total === 0) && (
            <div className="rounded-lg border border-slate-200/60 bg-white dark:border-slate-700/60 dark:bg-slate-900 px-8 py-16 text-center">
              <ShieldAlert className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">No human gates created yet</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Gates are created when E2E flows reach human decision points.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
