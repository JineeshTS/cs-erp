"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Brain,
  Zap,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  Loader2,
  RefreshCw,
  User,
  Target,
} from "lucide-react";

// ── Types ──

interface AiPerformanceMetrics {
  execution: {
    totalAiSteps: number;
    completedAiSteps: number;
    failedAiSteps: number;
    fallbackSteps: number;
    successRate: number;
    avgDurationMs: number;
    totalTokensUsed: number;
    estimatedCostUsd: number;
  };
  recommendations: {
    totalRecommendations: number;
    followedByHuman: number;
    overriddenByHuman: number;
    accuracyRate: number;
    avgConfidence: number;
    byDecision: Array<{
      decision: string;
      count: number;
      followedAi: number;
    }>;
  };
  autoApproval: {
    totalAutoApproved: number;
    totalManualDecisions: number;
    autoApproveRate: number;
    avgAutoApproveConfidence: number;
  };
  speed: {
    avgAiStepMs: number;
    avgHumanGateMinutes: number;
    speedMultiplier: number;
  };
}

// ── Component ──

export default function AiPerformancePage() {
  const [metrics, setMetrics] = useState<AiPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/process-engine/ai-performance?days=${days}`);
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) {
        setError("Failed to load AI metrics");
        return;
      }
      const body = await res.json();
      setMetrics(body.data);
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

  if (error || !metrics) {
    return (
      <div className="space-y-4 p-6">
        <Link href="/e2e-flows" className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900 dark:bg-rose-950">
          <AlertTriangle className="mx-auto h-8 w-8 text-rose-400" />
          <p className="mt-2 text-rose-700 dark:text-rose-300">{error ?? "Failed to load"}</p>
        </div>
      </div>
    );
  }

  const { execution, recommendations, autoApproval, speed } = metrics;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link href="/e2e-flows/analytics" className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400">
            <ArrowLeft className="h-4 w-4" /> Back to Analytics
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <Brain className="h-6 w-6 text-purple-500" />
            AI Performance
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
          <button onClick={() => { setLoading(true); fetchData(); }} className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Execution Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="AI Steps" value={execution.totalAiSteps} icon={Bot} color="text-blue-600" />
        <StatCard label="Success Rate" value={`${execution.successRate}%`} icon={CheckCircle} color={execution.successRate >= 90 ? "text-emerald-600" : "text-amber-600"} />
        <StatCard label="Tokens Used" value={formatNumber(execution.totalTokensUsed)} icon={Zap} color="text-purple-600" />
        <StatCard label="Est. Cost" value={`$${execution.estimatedCostUsd.toFixed(2)}`} icon={DollarSign} color="text-gray-600" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Execution Detail */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Bot className="h-4 w-4 text-blue-500" />
            Execution Breakdown
          </h3>
          <div className="mt-3 space-y-2">
            <MetricRow label="Completed" value={execution.completedAiSteps} total={execution.totalAiSteps} color="bg-emerald-500" />
            <MetricRow label="Failed" value={execution.failedAiSteps} total={execution.totalAiSteps} color="bg-rose-500" />
            <MetricRow label="Fallback" value={execution.fallbackSteps} total={execution.totalAiSteps} color="bg-amber-500" />
          </div>
          <div className="mt-3 border-t border-gray-100 pt-2 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
            Avg execution time: <span className="font-medium text-gray-900 dark:text-white">{execution.avgDurationMs}ms</span>
          </div>
        </div>

        {/* Speed Comparison */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Clock className="h-4 w-4 text-amber-500" />
            AI vs Human Speed
          </h3>
          <div className="mt-4 flex items-center gap-6">
            <div className="text-center">
              <Bot className="mx-auto h-8 w-8 text-blue-500" />
              <p className="mt-1 text-lg font-bold text-blue-600">{formatMs(speed.avgAiStepMs)}</p>
              <p className="text-xs text-gray-500">AI avg</p>
            </div>
            <div className="text-center">
              <TrendingUp className="mx-auto h-6 w-6 text-emerald-500" />
              <p className="text-2xl font-bold text-emerald-600">{speed.speedMultiplier}x</p>
              <p className="text-xs text-gray-500">faster</p>
            </div>
            <div className="text-center">
              <User className="mx-auto h-8 w-8 text-amber-500" />
              <p className="mt-1 text-lg font-bold text-amber-600">{formatMinutes(speed.avgHumanGateMinutes)}</p>
              <p className="text-xs text-gray-500">Human avg</p>
            </div>
          </div>
        </div>

        {/* Recommendation Accuracy */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Target className="h-4 w-4 text-purple-500" />
            Recommendation Accuracy
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Recommendations</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{recommendations.totalRecommendations}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Accuracy Rate</p>
              <p className={`text-lg font-bold ${recommendations.accuracyRate >= 80 ? "text-emerald-600" : "text-amber-600"}`}>
                {recommendations.accuracyRate}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Followed by Human</p>
              <p className="text-lg font-bold text-emerald-600">{recommendations.followedByHuman}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Overridden</p>
              <p className={`text-lg font-bold ${recommendations.overriddenByHuman > 0 ? "text-amber-600" : "text-gray-400"}`}>
                {recommendations.overriddenByHuman}
              </p>
            </div>
          </div>
          {recommendations.avgConfidence > 0 && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Avg confidence: <span className="font-medium">{(recommendations.avgConfidence * 100).toFixed(1)}%</span>
            </p>
          )}
          {recommendations.byDecision.length > 0 && (
            <div className="mt-2 border-t border-gray-100 pt-2 dark:border-gray-800">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">By Decision</p>
              {recommendations.byDecision.map((d) => (
                <div key={d.decision} className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span className="capitalize">{d.decision}</span>
                  <span>{d.followedAi}/{d.count} aligned with AI</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Auto-Approval */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Zap className="h-4 w-4 text-emerald-500" />
            Auto-Approval
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Auto-Approved</p>
              <p className="text-lg font-bold text-emerald-600">{autoApproval.totalAutoApproved}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manual Decisions</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{autoApproval.totalManualDecisions}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Auto-Approve Rate</p>
              <p className="text-lg font-bold text-blue-600">{autoApproval.autoApproveRate}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Confidence</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {(autoApproval.avgAutoApproveConfidence * 100).toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${autoApproval.autoApproveRate}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {autoApproval.totalAutoApproved} of {autoApproval.totalAutoApproved + autoApproval.totalManualDecisions} gates auto-resolved
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatMinutes(mins: number): string {
  if (mins < 1) return "<1m";
  if (mins < 60) return `${Math.round(mins)}m`;
  const hours = Math.floor(mins / 60);
  const remaining = Math.round(mins % 60);
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: typeof Bot; color: string }) {
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

function MetricRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 text-xs text-gray-600 dark:text-gray-400">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-16 text-right text-xs tabular-nums text-gray-500">{value} ({pct}%)</span>
    </div>
  );
}
