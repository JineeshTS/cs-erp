"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getCsrfToken } from "@/lib/client/csrf";
import {
  ShieldAlert,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Bot,
  Timer,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Inbox,
  Zap,
  User,
} from "lucide-react";

// ── Types ──

interface PendingGate {
  id: string;
  tenantId: string;
  stepInstanceId: string;
  flowInstanceId: string;
  gateType: string;
  assignedToRole: string;
  assignedToUserId: string | null;
  aiRecommendation: Record<string, unknown> | null;
  presentedInfo: Record<string, unknown> | null;
  slaDeadline: string;
  escalationToRole: string | null;
  priority: string;
  decision: string | null;
  decisionData: Record<string, unknown> | null;
  decidedAt: string | null;
  autoApproved: boolean;
  createdAt: string;
}

// ── Config ──

const GATE_TYPE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  approval: { bg: "bg-yellow-100 dark:bg-yellow-900/50", text: "text-yellow-700 dark:text-yellow-300", label: "Approval" },
  decision: { bg: "bg-orange-100 dark:bg-orange-900/50", text: "text-orange-700 dark:text-orange-300", label: "Decision" },
  input: { bg: "bg-blue-100 dark:bg-blue-900/50", text: "text-blue-700 dark:text-blue-300", label: "Input" },
  exception: { bg: "bg-red-100 dark:bg-red-900/50", text: "text-red-700 dark:text-red-300", label: "Exception" },
};

const PRIORITY_CONFIG: Record<string, { bg: string; text: string; sort: number }> = {
  critical: { bg: "bg-red-100 dark:bg-red-900/50", text: "text-red-700 dark:text-red-300", sort: 0 },
  high: { bg: "bg-orange-100 dark:bg-orange-900/50", text: "text-orange-700 dark:text-orange-300", sort: 1 },
  normal: { bg: "bg-blue-100 dark:bg-blue-900/50", text: "text-blue-700 dark:text-blue-300", sort: 2 },
  low: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", sort: 3 },
};

// ── Helpers ──

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSlaRemaining(deadline: string): { text: string; isOverdue: boolean; isWarning: boolean } {
  const d = new Date(deadline);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const isOverdue = diffMs < 0;
  const abs = Math.abs(diffMs);
  const hours = Math.floor(abs / 3600000);
  const mins = Math.round((abs % 3600000) / 60000);
  let text = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  if (isOverdue) text = `Overdue ${text}`;
  else text = `${text} left`;
  return { text, isOverdue, isWarning: !isOverdue && diffMs < 1800000 };
}

// ── Component ──

export default function HumanGateInboxPage() {
  const [gates, setGates] = useState<PendingGate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGate, setExpandedGate] = useState<string | null>(null);
  const [resolving, setResolving] = useState<string | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [showMyOnly, setShowMyOnly] = useState(false);

  const fetchGates = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (showMyOnly) params.set("myOnly", "true");
      const res = await fetch(`/api/v1/process-engine/human-gates?${params.toString()}`, { credentials: "include" });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) {
        setError("Failed to load gates");
        return;
      }
      const body = await res.json();
      setGates(body.data ?? []);
      setError(null);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [showMyOnly]);

  useEffect(() => {
    setLoading(true);
    fetchGates();
    const interval = setInterval(fetchGates, 15000);
    return () => clearInterval(interval);
  }, [fetchGates]);

  const resolveGate = async (gateId: string, decision: string) => {
    setResolving(gateId);
    setResolveError(null);
    try {
      const res = await fetch(`/api/v1/process-engine/human-gates/${gateId}/resolve`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfToken() },
        body: JSON.stringify({ decision }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: { message: "Failed to resolve gate" } }));
        setResolveError(errBody.error?.message ?? "Failed to resolve gate");
        return;
      }
      // Remove from list and refresh
      setGates((prev) => prev.filter((g) => g.id !== gateId));
      setExpandedGate(null);
    } catch {
      setResolveError("Network error");
    } finally {
      setResolving(null);
    }
  };

  // Filter and sort
  const filtered = gates
    .filter((g) => !filterType || g.gateType === filterType)
    .filter((g) => !filterPriority || g.priority === filterPriority)
    .sort((a, b) => {
      const pa = PRIORITY_CONFIG[a.priority]?.sort ?? 9;
      const pb = PRIORITY_CONFIG[b.priority]?.sort ?? 9;
      if (pa !== pb) return pa - pb;
      return new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime();
    });

  const overdue = filtered.filter((g) => new Date(g.slaDeadline) < new Date()).length;
  const critical = filtered.filter((g) => g.priority === "critical").length;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link href="/e2e-flows" className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400">
            <ArrowLeft className="h-4 w-4" /> Back to E2E Flows
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <Inbox className="h-6 w-6 text-amber-500" />
            Human Gate Inbox
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pending decisions requiring human review
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchGates(); }}
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Pending</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{filtered.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">SLA Overdue</p>
          <p className={`mt-1 text-2xl font-bold ${overdue > 0 ? "text-red-600" : "text-emerald-600"}`}>{overdue}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Critical</p>
          <p className={`mt-1 text-2xl font-bold ${critical > 0 ? "text-red-600" : "text-gray-400"}`}>{critical}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">With AI Reco</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">
            {filtered.filter((g) => g.aiRecommendation && Object.keys(g.aiRecommendation).length > 0).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="approval">Approval</option>
          <option value="decision">Decision</option>
          <option value="input">Input</option>
          <option value="exception">Exception</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={showMyOnly}
            onChange={(e) => setShowMyOnly(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Assigned to me
        </label>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {filtered.length} gate{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-950">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          <p className="text-sm text-rose-800 dark:text-rose-200">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!error && filtered.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white px-8 py-16 text-center dark:border-gray-700 dark:bg-gray-900">
          <CheckCircle className="mx-auto h-10 w-10 text-emerald-400" />
          <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">All caught up!</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">No pending gates require your attention.</p>
        </div>
      )}

      {/* Gate Cards */}
      <div className="space-y-3">
        {filtered.map((gate) => {
          const typeConf = GATE_TYPE_CONFIG[gate.gateType] ?? GATE_TYPE_CONFIG.approval;
          const prioConf = PRIORITY_CONFIG[gate.priority] ?? PRIORITY_CONFIG.normal;
          const sla = formatSlaRemaining(gate.slaDeadline);
          const isExpanded = expandedGate === gate.id;
          const info = (gate.presentedInfo ?? {}) as Record<string, unknown>;
          const aiRec = gate.aiRecommendation as Record<string, unknown> | null;
          const hasAiRec = aiRec && Object.keys(aiRec).length > 0;
          const confidence = hasAiRec && typeof aiRec.confidence === "number" ? aiRec.confidence : null;

          return (
            <div
              key={gate.id}
              className={`rounded-lg border bg-white dark:bg-gray-900 ${
                sla.isOverdue
                  ? "border-red-300 dark:border-red-800"
                  : sla.isWarning
                  ? "border-amber-300 dark:border-amber-800"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              {/* Card Header */}
              <button
                onClick={() => setExpandedGate(isExpanded ? null : gate.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <ShieldAlert className={`h-5 w-5 shrink-0 ${
                  sla.isOverdue ? "text-red-500" : "text-amber-500"
                }`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeConf.bg} ${typeConf.text}`}>
                      {typeConf.label}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${prioConf.bg} ${prioConf.text}`}>
                      {gate.priority}
                    </span>
                    {hasAiRec && (
                      <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                        <Bot className="h-3 w-3" />
                        AI{confidence !== null ? ` ${(confidence * 100).toFixed(0)}%` : ""}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">
                    {typeof info.stepName === "string" ? info.stepName : `Gate ${gate.id.slice(0, 8)}`}
                  </p>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {gate.assignedToRole}
                    </span>
                    {typeof info.module === "string" && (
                      <span>{info.module}</span>
                    )}
                    {typeof info.processRef === "string" && info.processRef && (
                      <span className="font-mono">{info.processRef}</span>
                    )}
                  </div>
                </div>

                {/* SLA Timer */}
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  sla.isOverdue ? "text-red-600 dark:text-red-400" : sla.isWarning ? "text-amber-600 dark:text-amber-400" : "text-gray-500 dark:text-gray-400"
                }`}>
                  <Timer className="h-4 w-4" />
                  {sla.text}
                </div>

                {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-4 py-4 dark:border-gray-800">
                  <div className="space-y-4">
                    {/* Context Info */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                      <div>
                        <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Flow</span>
                        <p>
                          <Link
                            href={`/e2e-flows/${gate.flowInstanceId}`}
                            className="text-blue-600 hover:underline dark:text-blue-400"
                          >
                            View Flow
                          </Link>
                        </p>
                      </div>
                      {typeof info.entityType === "string" && (
                        <div>
                          <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Entity</span>
                          <p className="text-gray-900 dark:text-white">{info.entityType} / {String(info.entityId ?? "")}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Created</span>
                        <p className="text-gray-900 dark:text-white">{formatDateTime(gate.createdAt)}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">SLA Deadline</span>
                        <p className={`font-medium ${sla.isOverdue ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
                          {formatDateTime(gate.slaDeadline)}
                        </p>
                      </div>
                      {gate.escalationToRole && (
                        <div>
                          <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Escalation To</span>
                          <p className="text-gray-900 dark:text-white">{gate.escalationToRole}</p>
                        </div>
                      )}
                    </div>

                    {/* AI Recommendation */}
                    {hasAiRec && (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI Recommendation</span>
                          {confidence !== null && (
                            <span className="rounded bg-blue-200 px-1.5 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                              {(confidence * 100).toFixed(1)}% confidence
                            </span>
                          )}
                        </div>
                        {typeof aiRec.recommendation === "string" && (
                          <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">{aiRec.recommendation}</p>
                        )}
                        {typeof aiRec.reason === "string" && (
                          <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">{aiRec.reason}</p>
                        )}
                        <pre className="mt-2 max-h-32 overflow-auto rounded bg-blue-100 p-2 text-xs text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                          {JSON.stringify(aiRec, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Presented Info */}
                    {gate.presentedInfo && Object.keys(gate.presentedInfo).length > 0 && (
                      <div>
                        <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Context Information</span>
                        <pre className="mt-1 max-h-32 overflow-auto rounded-md bg-gray-100 p-2 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {JSON.stringify(gate.presentedInfo, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Resolution Error */}
                    {resolveError && resolving === null && expandedGate === gate.id && (
                      <div className="flex items-center gap-2 rounded border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {resolveError}
                      </div>
                    )}

                    {/* Decision Buttons */}
                    <div className="flex items-center gap-3 border-t border-gray-100 pt-3 dark:border-gray-800">
                      {gate.gateType === "approval" && (
                        <>
                          <button
                            onClick={() => resolveGate(gate.id, "approved")}
                            disabled={resolving === gate.id}
                            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {resolving === gate.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                            Approve
                          </button>
                          <button
                            onClick={() => resolveGate(gate.id, "rejected")}
                            disabled={resolving === gate.id}
                            className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                        </>
                      )}
                      {gate.gateType === "decision" && (
                        <>
                          <button
                            onClick={() => resolveGate(gate.id, "approved")}
                            disabled={resolving === gate.id}
                            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {resolving === gate.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                            Accept
                          </button>
                          <button
                            onClick={() => resolveGate(gate.id, "rejected")}
                            disabled={resolving === gate.id}
                            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            <XCircle className="h-4 w-4" />
                            Decline
                          </button>
                        </>
                      )}
                      {gate.gateType === "input" && (
                        <button
                          onClick={() => resolveGate(gate.id, "input_provided")}
                          disabled={resolving === gate.id}
                          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {resolving === gate.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                          Submit Input
                        </button>
                      )}
                      {gate.gateType === "exception" && (
                        <>
                          <button
                            onClick={() => resolveGate(gate.id, "approved")}
                            disabled={resolving === gate.id}
                            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {resolving === gate.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                            Resolve
                          </button>
                          <button
                            onClick={() => resolveGate(gate.id, "rejected")}
                            disabled={resolving === gate.id}
                            className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4" />
                            Escalate
                          </button>
                        </>
                      )}
                      <Link
                        href={`/e2e-flows/${gate.flowInstanceId}`}
                        className="ms-auto text-sm text-blue-600 hover:underline dark:text-blue-400"
                      >
                        View Full Flow →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
