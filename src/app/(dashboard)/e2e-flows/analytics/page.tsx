"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Bot,
  User,
  Monitor,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  Zap,
} from "lucide-react";

// ── Types ──

interface FlowAnalytics {
  overview: {
    totalFlows: number;
    completedFlows: number;
    failedFlows: number;
    activeFlows: number;
    completionRate: number;
    avgDurationMinutes: number;
  };
  byFlowType: Array<{
    e2eFlowId: string;
    total: number;
    completed: number;
    failed: number;
    avgDurationMinutes: number;
  }>;
  gateMetrics: {
    totalGates: number;
    resolved: number;
    pending: number;
    autoApproved: number;
    avgResponseMinutes: number;
    autoApproveRate: number;
    byType: Array<{
      gateType: string;
      total: number;
      resolved: number;
      avgResponseMinutes: number;
    }>;
  };
  throughput: Array<{
    date: string;
    started: number;
    completed: number;
  }>;
  executorBreakdown: {
    aiSteps: number;
    humanSteps: number;
    systemSteps: number;
    aiPercentage: number;
  };
}

interface RiskScanResult {
  alerts: Array<{
    type: string;
    severity: string;
    title: string;
    description: string;
    flowInstanceId?: string;
  }>;
  scannedFlows: number;
  scannedGates: number;
  scanDurationMs: number;
}

// ── Component ──

export default function ProcessAnalyticsPage() {
  const [analytics, setAnalytics] = useState<FlowAnalytics | null>(null);
  const [risks, setRisks] = useState<RiskScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchData = useCallback(async () => {
    try {
      const [analyticsRes, risksRes] = await Promise.all([
        fetch(`/api/v1/process-engine/analytics?days=${days}`, { credentials: "include" }),
        fetch("/api/v1/process-engine/risk-alerts", { credentials: "include" }),
      ]);

      if (analyticsRes.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!analyticsRes.ok) {
        setError("Failed to load analytics");
        return;
      }

      const analyticsBody = await analyticsRes.json();
      setAnalytics(analyticsBody.data);

      if (risksRes.ok) {
        const risksBody = await risksRes.json();
        setRisks(risksBody.data);
      }

      setError(null);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="space-y-4 p-6">
        <Link href="/e2e-flows" className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400">
          <ArrowLeft className="h-4 w-4" /> Back to E2E Flows
        </Link>
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900 dark:bg-rose-950">
          <AlertTriangle className="mx-auto h-8 w-8 text-rose-400" />
          <p className="mt-2 text-rose-700 dark:text-rose-300">{error ?? "Failed to load analytics"}</p>
        </div>
      </div>
    );
  }

  const { overview, byFlowType, gateMetrics, throughput, executorBreakdown } = analytics;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link href="/e2e-flows" className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400">
            <ArrowLeft className="h-4 w-4" /> Back to E2E Flows
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <BarChart3 className="h-6 w-6 text-blue-500" />
            Process Analytics
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={() => { setLoading(true); fetchData(); }}
            className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Flows" value={overview.totalFlows} icon={BarChart3} color="text-blue-600" />
        <StatCard label="Completed" value={overview.completedFlows} icon={CheckCircle} color="text-emerald-600" />
        <StatCard label="Failed" value={overview.failedFlows} icon={XCircle} color="text-rose-600" />
        <StatCard label="Active" value={overview.activeFlows} icon={Zap} color="text-amber-600" />
        <StatCard label="Completion %" value={`${overview.completionRate}%`} icon={TrendingUp} color="text-emerald-600" />
        <StatCard label="Avg Duration" value={formatMinutes(overview.avgDurationMinutes)} icon={Clock} color="text-gray-600" />
      </div>

      {/* AI vs Human Breakdown */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Bot className="h-4 w-4 text-blue-500" />
            Executor Breakdown
          </h3>
          <div className="mt-3 space-y-2">
            <ProgressBar label="AI Agent" value={executorBreakdown.aiSteps} total={executorBreakdown.aiSteps + executorBreakdown.humanSteps + executorBreakdown.systemSteps} color="bg-blue-500" icon={Bot} />
            <ProgressBar label="Human" value={executorBreakdown.humanSteps} total={executorBreakdown.aiSteps + executorBreakdown.humanSteps + executorBreakdown.systemSteps} color="bg-amber-500" icon={User} />
            <ProgressBar label="System" value={executorBreakdown.systemSteps} total={executorBreakdown.aiSteps + executorBreakdown.humanSteps + executorBreakdown.systemSteps} color="bg-gray-500" icon={Monitor} />
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            AI automation rate: <span className="font-bold text-blue-600">{executorBreakdown.aiPercentage}%</span>
          </p>
        </div>

        {/* Gate Metrics */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            Gate Metrics
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Gates</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{gateMetrics.totalGates}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
              <p className={`text-lg font-bold ${gateMetrics.pending > 0 ? "text-amber-600" : "text-gray-400"}`}>{gateMetrics.pending}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Auto-Approved</p>
              <p className="text-lg font-bold text-blue-600">{gateMetrics.autoApproved} ({gateMetrics.autoApproveRate}%)</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Response</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatMinutes(gateMetrics.avgResponseMinutes)}</p>
            </div>
          </div>
          {gateMetrics.byType.length > 0 && (
            <div className="mt-3 border-t border-gray-100 pt-2 dark:border-gray-800">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">By Type</p>
              {gateMetrics.byType.map((gt) => (
                <div key={gt.gateType} className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span className="capitalize">{gt.gateType}</span>
                  <span>{gt.resolved}/{gt.total} resolved, avg {formatMinutes(gt.avgResponseMinutes)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Throughput Chart (simple bar representation) */}
      {throughput.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Daily Throughput</h3>
          <div className="mt-3 flex items-end gap-1 h-32">
            {throughput.map((day) => {
              const maxVal = Math.max(...throughput.map((d) => Math.max(d.started, d.completed)), 1);
              const startedH = (day.started / maxVal) * 100;
              const completedH = (day.completed / maxVal) * 100;
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-0.5" title={`${day.date}: ${day.started} started, ${day.completed} completed`}>
                  <div className="flex w-full gap-0.5 items-end" style={{ height: "100%" }}>
                    <div className="flex-1 rounded-t bg-blue-400 dark:bg-blue-600 transition-all" style={{ height: `${startedH}%`, minHeight: day.started > 0 ? "4px" : "0" }} />
                    <div className="flex-1 rounded-t bg-emerald-400 dark:bg-emerald-600 transition-all" style={{ height: `${completedH}%`, minHeight: day.completed > 0 ? "4px" : "0" }} />
                  </div>
                  <span className="text-[9px] text-gray-400 tabular-nums">{day.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-400" /> Started</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Completed</span>
          </div>
        </div>
      )}

      {/* Top Flow Types */}
      {byFlowType.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Flow Types</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="px-4 py-2 text-start text-xs font-semibold uppercase text-gray-500">Flow ID</th>
                <th className="px-4 py-2 text-start text-xs font-semibold uppercase text-gray-500">Total</th>
                <th className="px-4 py-2 text-start text-xs font-semibold uppercase text-gray-500">Completed</th>
                <th className="px-4 py-2 text-start text-xs font-semibold uppercase text-gray-500">Failed</th>
                <th className="px-4 py-2 text-start text-xs font-semibold uppercase text-gray-500">Avg Duration</th>
                <th className="px-4 py-2 text-start text-xs font-semibold uppercase text-gray-500">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {byFlowType.map((ft) => (
                <tr key={ft.e2eFlowId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-2 font-mono text-gray-900 dark:text-white">{ft.e2eFlowId}</td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{ft.total}</td>
                  <td className="px-4 py-2 text-emerald-600">{ft.completed}</td>
                  <td className="px-4 py-2 text-rose-600">{ft.failed}</td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{formatMinutes(ft.avgDurationMinutes)}</td>
                  <td className="px-4 py-2">
                    <span className={`font-medium ${ft.total > 0 && ft.completed / ft.total >= 0.8 ? "text-emerald-600" : "text-gray-500"}`}>
                      {ft.total > 0 ? Math.round((ft.completed / ft.total) * 100) : 0}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Risk Alerts */}
      {risks && risks.alerts.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            Active Risk Alerts ({risks.alerts.length})
          </h3>
          <div className="mt-2 space-y-2">
            {risks.alerts.slice(0, 10).map((alert, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className={`mt-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                  alert.severity === "critical" ? "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200" :
                  alert.severity === "high" ? "bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-200" :
                  "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                }`}>
                  {alert.severity}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{alert.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{alert.description}</p>
                </div>
                {alert.flowInstanceId && (
                  <Link
                    href={`/e2e-flows/${alert.flowInstanceId}`}
                    className="shrink-0 text-xs text-blue-600 hover:underline dark:text-blue-400"
                  >
                    View
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ──

function formatMinutes(mins: number): string {
  if (mins < 1) return "<1m";
  if (mins < 60) return `${Math.round(mins)}m`;
  const hours = Math.floor(mins / 60);
  const remaining = Math.round(mins % 60);
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: typeof BarChart3; color: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function ProgressBar({ label, value, total, color, icon: Icon }: { label: string; value: number; total: number; color: string; icon: typeof Bot }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-gray-400" />
      <span className="w-16 text-xs text-gray-600 dark:text-gray-400">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-16 text-right text-xs tabular-nums text-gray-500">{value} ({pct}%)</span>
    </div>
  );
}
