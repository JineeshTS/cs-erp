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
  ArrowLeft,
} from "lucide-react";

interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  waitingApproval: number;
  completed: number;
  failed: number;
  pendingApprovals: number;
}

interface ProcessInstance {
  id: string;
  processId: string;
  processName: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  triggerType: string;
  entityType: string | null;
  entityId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  failureReason: string | null;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300", label: "Pending" },
  in_progress: { bg: "bg-blue-100 dark:bg-blue-900/50", text: "text-blue-700 dark:text-blue-300", label: "In Progress" },
  waiting_approval: { bg: "bg-amber-100 dark:bg-amber-900/50", text: "text-amber-700 dark:text-amber-300", label: "Awaiting Approval" },
  completed: { bg: "bg-emerald-100 dark:bg-emerald-900/50", text: "text-emerald-700 dark:text-emerald-300", label: "Completed" },
  failed: { bg: "bg-rose-100 dark:bg-rose-900/50", text: "text-rose-700 dark:text-rose-300", label: "Failed" },
  cancelled: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400", label: "Cancelled" },
};

function formatDuration(startStr: string | null, endStr: string | null): string {
  if (!startStr) return "—";
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

export default function ProcessMonitorPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [instances, setInstances] = useState<ProcessInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (statusFilter) params.set("status", statusFilter);
      const [statsRes, instancesRes] = await Promise.all([
        fetch("/api/v1/process-engine/dashboard"),
        fetch(`/api/v1/process-engine/instances?${params.toString()}`),
      ]);

      if (statsRes.status === 401 || instancesRes.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!statsRes.ok || !instancesRes.ok) {
        setError("Failed to load process data");
        return;
      }

      const [statsBody, instancesBody] = await Promise.all([
        statsRes.json(),
        instancesRes.json(),
      ]);

      setStats(statsBody.data);
      setInstances(instancesBody.data ?? []);
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

  const statCards = stats
    ? [
        { label: "Total", value: stats.total, icon: Activity, color: "text-slate-600 dark:text-slate-400" },
        { label: "Pending", value: stats.pending, icon: Clock, color: "text-slate-600 dark:text-slate-400" },
        { label: "In Progress", value: stats.inProgress, icon: Loader2, color: "text-blue-600 dark:text-blue-400" },
        { label: "Waiting Approval", value: stats.waitingApproval, icon: Pause, color: "text-amber-600 dark:text-amber-400" },
        { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400" },
        { label: "Failed", value: stats.failed, icon: XCircle, color: "text-rose-600 dark:text-rose-400" },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/processes" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Process Monitor</h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Live view of all process instances — auto-refreshes every 10s
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
          {statCards.map((s) => (
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

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-slate-300 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="waiting_approval">Waiting Approval</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {instances.length} instance{instances.length !== 1 ? "s" : ""}
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

      {/* Loading skeleton */}
      {loading && !instances.length && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && instances.length === 0 && !error && (
        <div className="rounded-lg border border-slate-200/60 bg-white dark:border-slate-700/60 dark:bg-slate-900 px-8 py-16 text-center">
          <Activity className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">No process instances found</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Go to the <Link href="/processes" className="text-blue-600 hover:underline dark:text-blue-400">Process Hub</Link> to run a process.
          </p>
        </div>
      )}

      {/* Table */}
      {instances.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200/60 bg-white dark:border-slate-700/60 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Process</th>
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
                const statusCfg = STATUS_CONFIG[inst.status] ?? STATUS_CONFIG.pending;
                const pct = inst.totalSteps > 0 ? Math.round((inst.currentStep / inst.totalSteps) * 100) : 0;
                return (
                  <tr
                    key={inst.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    onClick={() => {/* Future: navigate to /processes/instances/[id] */}}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[200px]">{inst.processName}</div>
                      <div className="text-xs text-slate-400 font-mono">{inst.processId}</div>
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
                              "bg-blue-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 tabular-nums">{inst.currentStep}/{inst.totalSteps}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{inst.triggerType}</span>
                    </td>
                    <td className="px-4 py-3">
                      {inst.entityType ? (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {inst.entityType}{inst.entityId ? ` ${inst.entityId.slice(0, 8)}…` : ""}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        {formatRelative(inst.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        {formatDuration(inst.startedAt ?? inst.createdAt, inst.completedAt)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
