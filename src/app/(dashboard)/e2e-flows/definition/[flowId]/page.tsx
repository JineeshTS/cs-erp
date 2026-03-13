"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Activity,
  Bot,
  CheckCircle,
  Clock,
  ExternalLink,
  GitBranch,
  Loader2,
  Monitor,
  Pause,
  Play,
  RefreshCw,
  User,
  XCircle,
  Zap,
  ChevronDown,
  ChevronRight,
  Filter,
  Plus,
  List,
  LayoutGrid,
  Database,
  Link2,
  ListChecks,
  ShieldCheck,
  FileOutput,
  UserCheck,
  Timer,
} from "lucide-react";
import { E2E_PROCESS_FLOWS } from "@/data/e2e-process-flows";
import type { E2EFlowStep, E2EProcessFlow, FlowCategory } from "@/types/processes";
import { FLOW_CATEGORY_LABELS } from "@/types/processes";

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
  metadata: Record<string, unknown> | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
}

// ── Status Config ──

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-blue-100 dark:bg-blue-900/50", text: "text-blue-700 dark:text-blue-300", label: "Active" },
  paused_at_gate: { bg: "bg-amber-100 dark:bg-amber-900/50", text: "text-amber-700 dark:text-amber-300", label: "At Gate" },
  completed: { bg: "bg-emerald-100 dark:bg-emerald-900/50", text: "text-emerald-700 dark:text-emerald-300", label: "Completed" },
  failed: { bg: "bg-rose-100 dark:bg-rose-900/50", text: "text-rose-700 dark:text-rose-300", label: "Failed" },
  cancelled: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400", label: "Cancelled" },
};

const STEP_TYPE_STYLE: Record<string, { bg: string; border: string; text: string }> = {
  ai: { bg: "bg-blue-50 dark:bg-blue-950", border: "border-blue-200 dark:border-blue-800", text: "text-blue-800 dark:text-blue-300" },
  human: { bg: "bg-green-50 dark:bg-green-950", border: "border-green-200 dark:border-green-800", text: "text-green-800 dark:text-green-300" },
  system: { bg: "bg-gray-50 dark:bg-gray-800", border: "border-gray-200 dark:border-gray-700", text: "text-gray-700 dark:text-gray-300" },
};

const EXECUTOR_ICONS: Record<string, typeof Bot> = {
  ai_agent: Bot,
  ai: Bot,
  human: User,
  system: Monitor,
  external: ExternalLink,
};

const GATE_COLORS: Record<string, string> = {
  approval: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
  decision: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  input: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  exception: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

// ── Helpers ──

function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match?.[1] ?? "csrf-placeholder";
}

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

// ── Group steps by phase ──

function groupByPhase(steps: E2EFlowStep[]): { phase: string; steps: (E2EFlowStep & { index: number })[] }[] {
  const groups: { phase: string; steps: (E2EFlowStep & { index: number })[] }[] = [];
  let current: { phase: string; steps: (E2EFlowStep & { index: number })[] } | null = null;

  steps.forEach((step, i) => {
    const phase = step.phase ?? "Steps";
    if (!current || current.phase !== phase) {
      current = { phase, steps: [] };
      groups.push(current);
    }
    current.steps.push({ ...step, index: i });
  });

  return groups;
}

// ── Component ──

export default function FlowDefinitionPage() {
  const params = useParams();
  const router = useRouter();
  const flowId = params.flowId as string;

  const flow = E2E_PROCESS_FLOWS.find((f) => f.id === flowId);

  const [instances, setInstances] = useState<FlowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [starting, setStarting] = useState(false);
  const [activeTab, setActiveTab] = useState<"steps" | "transactions">("steps");
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [expandedStepIdx, setExpandedStepIdx] = useState<Set<number>>(new Set());

  // Auto-expand all phases on mount
  useEffect(() => {
    if (flow) {
      const phases = groupByPhase(flow.steps);
      setExpandedPhases(new Set(phases.map((p) => p.phase)));
    }
  }, [flow]);

  const fetchInstances = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "50", e2eFlowId: flowId });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/v1/process-engine/e2e-flows?${params.toString()}`);
      if (res.status === 401) { window.location.href = "/login"; return; }
      if (!res.ok) return;
      const body = await res.json();
      setInstances(body.data ?? []);
    } catch {
      // Silently fail — user can retry
    } finally {
      setLoading(false);
    }
  }, [flowId, statusFilter]);

  useEffect(() => {
    fetchInstances();
    const interval = setInterval(fetchInstances, 10000);
    return () => clearInterval(interval);
  }, [fetchInstances]);

  const handleStartNew = async () => {
    if (!flow) return;
    setStarting(true);
    try {
      const res = await fetch("/api/v1/process-engine/e2e-flows", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": getCsrfToken() },
        body: JSON.stringify({
          e2eFlowId: flow.id,
          entityType: flow.entityType ?? "manual",
          entityId: `manual-${Date.now()}`,
          triggerEvent: "manual.initiated",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        alert(`Failed to start flow: ${err?.error?.message ?? res.statusText}`);
        return;
      }
      const body = await res.json();
      router.push(`/e2e-flows/${body.data.id}`);
    } catch {
      alert("Network error — could not start flow");
    } finally {
      setStarting(false);
    }
  };

  const togglePhase = (phase: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phase)) next.delete(phase);
      else next.add(phase);
      return next;
    });
  };

  const toggleStepDetail = (idx: number) => {
    setExpandedStepIdx((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  if (!flow) {
    return (
      <div className="space-y-4 p-6">
        <Link href="/processes?tab=e2e" className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400">
          <ArrowLeft className="h-4 w-4" /> Back to Process Hub
        </Link>
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900 dark:bg-rose-950">
          <XCircle className="mx-auto h-8 w-8 text-rose-400" />
          <p className="mt-2 text-rose-700 dark:text-rose-300">Flow definition &quot;{flowId}&quot; not found</p>
        </div>
      </div>
    );
  }

  const phaseGroups = groupByPhase(flow.steps);
  const aiSteps = flow.steps.filter((s) => s.type === "ai").length;
  const humanSteps = flow.steps.filter((s) => s.type === "human").length;
  const systemSteps = flow.steps.filter((s) => s.type === "system").length;
  const gateSteps = flow.steps.filter((s) => s.gateType).length;
  const categoryLabel = flow.category ? FLOW_CATEGORY_LABELS[flow.category] : "Uncategorized";

  // Transaction stats
  const txActive = instances.filter((i) => i.status === "active").length;
  const txAtGate = instances.filter((i) => i.status === "paused_at_gate").length;
  const txCompleted = instances.filter((i) => i.status === "completed").length;
  const txFailed = instances.filter((i) => i.status === "failed").length;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link href="/processes?tab=e2e" className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400">
            <ArrowLeft className="h-4 w-4" /> Back to Process Hub
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-500 dark:bg-gray-800 dark:text-gray-400">{flow.id}</span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{flow.name}</h1>
          </div>
          <p className="max-w-3xl text-sm text-gray-500 dark:text-gray-400">{flow.description}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
              {categoryLabel}
            </span>
            {flow.triggerEvent && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                Trigger: {flow.triggerEvent}
              </span>
            )}
            {flow.typicalTimeline && (
              <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                <Clock className="h-3 w-3" /> {flow.typicalTimeline}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleStartNew}
          disabled={starting}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Start New Transaction
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <div className="rounded-lg border bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Steps</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{flow.steps.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">Phases</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{phaseGroups.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
          <p className="flex items-center gap-1 text-xs text-blue-500"><Bot className="h-3 w-3" /> AI Steps</p>
          <p className="text-xl font-bold text-blue-600">{aiSteps}</p>
        </div>
        <div className="rounded-lg border bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
          <p className="flex items-center gap-1 text-xs text-green-500"><User className="h-3 w-3" /> Human Steps</p>
          <p className="text-xl font-bold text-green-600">{humanSteps}</p>
        </div>
        <div className="rounded-lg border bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
          <p className="flex items-center gap-1 text-xs text-gray-500"><Monitor className="h-3 w-3" /> System</p>
          <p className="text-xl font-bold text-gray-600 dark:text-gray-300">{systemSteps}</p>
        </div>
        <div className="rounded-lg border bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-amber-500">Gates</p>
          <p className="text-xl font-bold text-amber-600">{gateSteps}</p>
        </div>
        <div className="rounded-lg border bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-blue-500">Active Tx</p>
          <p className="text-xl font-bold text-blue-600">{txActive + txAtGate}</p>
        </div>
        <div className="rounded-lg border bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-emerald-500">Completed Tx</p>
          <p className="text-xl font-bold text-emerald-600">{txCompleted}</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("steps")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "steps"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          Flow Steps ({flow.steps.length})
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "transactions"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <List className="h-4 w-4" />
          Transactions ({instances.length})
          {(txActive + txAtGate) > 0 && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              {txActive + txAtGate} active
            </span>
          )}
        </button>
      </div>

      {/* ══════════════ STEPS TAB ══════════════ */}
      {activeTab === "steps" && (
        <div className="space-y-4">
          {phaseGroups.map((group) => {
            const isExpanded = expandedPhases.has(group.phase);
            return (
              <div key={group.phase} className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 overflow-hidden">
                {/* Phase Header */}
                <button
                  onClick={() => togglePhase(group.phase)}
                  className="flex w-full items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{group.phase}</h3>
                    <span className="text-xs text-gray-400">{group.steps.length} steps</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-xs text-blue-500">
                      <Bot className="h-3 w-3" /> {group.steps.filter((s) => s.type === "ai").length}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-green-500">
                      <User className="h-3 w-3" /> {group.steps.filter((s) => s.type === "human").length}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Monitor className="h-3 w-3" /> {group.steps.filter((s) => s.type === "system").length}
                    </span>
                  </div>
                </button>

                {/* Phase Steps */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                    {group.steps.map((step) => {
                      const style = STEP_TYPE_STYLE[step.type] ?? STEP_TYPE_STYLE.system;
                      const ExecutorIcon = EXECUTOR_ICONS[step.executorType ?? step.type] ?? Monitor;
                      const hasRichData = !!(step.description || step.inputFields?.length || step.subTasks?.length);
                      const isStepExpanded = expandedStepIdx.has(step.index);

                      return (
                        <div key={step.index}>
                          <div
                            className={`flex items-center gap-3 px-4 py-3 ${hasRichData ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" : ""}`}
                            onClick={() => hasRichData && toggleStepDetail(step.index)}
                          >
                            {/* Step Number */}
                            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${style.bg} ${style.text} border ${style.border}`}>
                              {step.index + 1}
                            </div>

                            {/* Step Info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{step.step}</span>
                                {step.processRef && (
                                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                    {step.processRef}
                                  </span>
                                )}
                                {step.gateType && (
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${GATE_COLORS[step.gateType] ?? ""}`}>
                                    {step.gateType} gate
                                  </span>
                                )}
                                {step.condition && (
                                  <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                    conditional
                                  </span>
                                )}
                                {step.assignedRole && (
                                  <span className="flex items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                    <UserCheck className="h-2.5 w-2.5" />
                                    {step.assignedRole}
                                  </span>
                                )}
                              </div>
                              <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <ExecutorIcon className="h-3 w-3" />
                                  {step.module}
                                </span>
                                {step.slaHours != null && (
                                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                    <Timer className="h-3 w-3" />
                                    SLA: {step.slaHours < 1 ? `${Math.round(step.slaHours * 60)}m` : `${step.slaHours}h`}
                                  </span>
                                )}
                                {step.condition && (
                                  <span className="italic text-purple-500 dark:text-purple-400">
                                    if: {step.condition}
                                  </span>
                                )}
                                {hasRichData && (
                                  <span className="text-blue-500 dark:text-blue-400">
                                    {step.inputFields?.length ?? 0} inputs &middot; {step.subTasks?.length ?? 0} sub-tasks
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Expand indicator for rich steps */}
                            {hasRichData && (
                              <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${isStepExpanded ? "rotate-90" : ""}`} />
                            )}

                            {/* Module Link */}
                            {step.moduleUrl && (
                              <Link
                                href={step.moduleUrl}
                                target="_blank"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                                title={`Open ${step.module} (new tab)`}
                              >
                                <ExternalLink className="h-3 w-3" />
                                Open Module
                              </Link>
                            )}
                          </div>

                          {/* ── Rich Step Detail Panel ── */}
                          {isStepExpanded && hasRichData && (
                            <div className="border-t border-gray-100 bg-gray-50/70 px-4 py-4 dark:border-gray-800 dark:bg-gray-900/40">
                              <div className="ml-10 space-y-4">
                                {/* Description */}
                                {step.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {step.description}
                                  </p>
                                )}

                                {/* Input Data Requirements */}
                                {step.inputFields && step.inputFields.length > 0 && (
                                  <div>
                                    <h5 className="flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">
                                      <Database className="h-3.5 w-3.5 text-blue-500" />
                                      Input Data Required ({step.inputFields.length})
                                    </h5>
                                    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                                      <table className="w-full text-xs">
                                        <thead>
                                          <tr className="bg-gray-100 dark:bg-gray-800">
                                            <th className="px-3 py-1.5 text-left font-medium text-gray-600 dark:text-gray-400">Field</th>
                                            <th className="px-3 py-1.5 text-left font-medium text-gray-600 dark:text-gray-400">Source</th>
                                            <th className="px-3 py-1.5 text-left font-medium text-gray-600 dark:text-gray-400">Provided By</th>
                                            <th className="px-3 py-1.5 text-center font-medium text-gray-600 dark:text-gray-400">Required</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                          {step.inputFields.map((f, fi) => (
                                            <tr key={fi} className="bg-white dark:bg-gray-900">
                                              <td className="px-3 py-1.5 font-medium text-gray-900 dark:text-white">{f.field}</td>
                                              <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">{f.source}</td>
                                              <td className="px-3 py-1.5">
                                                {f.providedBy ? (
                                                  <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                    {f.providedBy}
                                                  </span>
                                                ) : (
                                                  <span className="text-gray-400">—</span>
                                                )}
                                              </td>
                                              <td className="px-3 py-1.5 text-center">
                                                {f.required ? (
                                                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                                    <span className="text-[8px] font-bold text-red-600 dark:text-red-400">!</span>
                                                  </span>
                                                ) : (
                                                  <span className="text-gray-400">opt</span>
                                                )}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}

                                {/* Output Fields */}
                                {step.outputFields && step.outputFields.length > 0 && (
                                  <div>
                                    <h5 className="flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">
                                      <FileOutput className="h-3.5 w-3.5 text-emerald-500" />
                                      Output Data ({step.outputFields.length})
                                    </h5>
                                    <div className="flex flex-wrap gap-1.5">
                                      {step.outputFields.map((o, oi) => (
                                        <span key={oi} className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                          {o}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Dependencies */}
                                {step.dependencies && step.dependencies.length > 0 && (
                                  <div>
                                    <h5 className="flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">
                                      <Link2 className="h-3.5 w-3.5 text-orange-500" />
                                      Dependencies ({step.dependencies.length})
                                    </h5>
                                    <div className="space-y-1">
                                      {step.dependencies.map((d, di) => (
                                        <div key={di} className="flex items-center gap-2 rounded bg-white px-3 py-1.5 text-xs dark:bg-gray-900">
                                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                                            d.type === "hard" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" :
                                            d.type === "soft" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" :
                                            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                          }`}>
                                            {d.type}
                                          </span>
                                          <span className="font-mono text-gray-500 dark:text-gray-400">{d.ref}</span>
                                          <span className="text-gray-600 dark:text-gray-400">{d.label}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Sub-Tasks */}
                                {step.subTasks && step.subTasks.length > 0 && (
                                  <div>
                                    <h5 className="flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">
                                      <ListChecks className="h-3.5 w-3.5 text-purple-500" />
                                      Sub-Tasks ({step.subTasks.length})
                                    </h5>
                                    <div className="space-y-1">
                                      {step.subTasks.map((st, si) => {
                                        const SubIcon = st.type === "ai" ? Bot : st.type === "human" ? User : Monitor;
                                        return (
                                          <div key={si} className="flex items-start gap-2 rounded bg-white px-3 py-1.5 text-xs dark:bg-gray-900">
                                            <SubIcon className={`mt-0.5 h-3 w-3 shrink-0 ${
                                              st.type === "ai" ? "text-blue-500" : st.type === "human" ? "text-green-500" : "text-gray-500"
                                            }`} />
                                            <span className="text-gray-900 dark:text-white">{st.task}</span>
                                            {st.role && (
                                              <span className="ml-auto shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                                {st.role}
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Validations */}
                                {step.validations && step.validations.length > 0 && (
                                  <div>
                                    <h5 className="flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">
                                      <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
                                      Validations ({step.validations.length})
                                    </h5>
                                    <ul className="space-y-0.5">
                                      {step.validations.map((v, vi) => (
                                        <li key={vi} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                          <CheckCircle className="h-3 w-3 shrink-0 text-teal-500" />
                                          {v}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Flow Metadata */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {flow.aiAgents.length > 0 && (
              <div className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">AI Agents ({flow.aiAgents.length})</h4>
                <div className="flex flex-wrap gap-1">
                  {flow.aiAgents.map((a) => (
                    <span key={a} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">{a}</span>
                  ))}
                </div>
              </div>
            )}
            {flow.conditionalBranches && flow.conditionalBranches.length > 0 && (
              <div className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">Scenario Branches</h4>
                <ul className="space-y-1">
                  {flow.conditionalBranches.map((b) => (
                    <li key={b} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                      <GitBranch className="h-3 w-3 mt-0.5 shrink-0 text-purple-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {flow.kpis.length > 0 && (
              <div className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">KPIs</h4>
                <ul className="space-y-1">
                  {flow.kpis.map((k) => (
                    <li key={k} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                      <Activity className="h-3 w-3 mt-0.5 shrink-0 text-emerald-500" />
                      {k}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ TRANSACTIONS TAB ══════════════ */}
      {activeTab === "transactions" && (
        <div className="space-y-4">
          {/* Status Filter + Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setLoading(true); }}
                className="rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="paused_at_gate">At Gate</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <span className="text-xs text-gray-400">{instances.length} transaction{instances.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setLoading(true); fetchInstances(); }}
                className="rounded-md border border-gray-200 dark:border-gray-700 p-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={handleStartNew}
                disabled={starting}
                className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {starting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                New
              </button>
            </div>
          </div>

          {/* Status Summary Bar */}
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: "Active", count: txActive, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
              { label: "At Gate", count: txAtGate, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
              { label: "Completed", count: txCompleted, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
              { label: "Failed", count: txFailed, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950" },
              { label: "Total", count: instances.length, color: "text-gray-600 dark:text-gray-300", bg: "bg-gray-50 dark:bg-gray-800" },
            ].map((s) => (
              <div key={s.label} className={`rounded-md ${s.bg} px-3 py-2 text-center`}>
                <p className={`text-lg font-bold ${s.color}`}>{s.count}</p>
                <p className="text-[10px] text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Loading */}
          {loading && instances.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          )}

          {/* Empty State */}
          {!loading && instances.length === 0 && (
            <div className="rounded-lg border bg-white px-8 py-16 text-center dark:border-gray-700 dark:bg-gray-900">
              <GitBranch className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                No transactions found{statusFilter ? ` with status "${statusFilter}"` : ""}
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Click &quot;Start New Transaction&quot; to initiate this flow.
              </p>
              <button
                onClick={handleStartNew}
                disabled={starting}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Start New Transaction
              </button>
            </div>
          )}

          {/* Transaction Table */}
          {instances.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-gray-500">Transaction</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-gray-500">Status</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-gray-500">Progress</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-gray-500">Entity</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-gray-500">Started</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-gray-500">Duration</th>
                    <th className="px-4 py-3 text-end text-xs font-semibold uppercase text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {instances.map((inst) => {
                    const statusCfg = STATUS_CONFIG[inst.status] ?? STATUS_CONFIG.active;
                    const pct = inst.totalSteps > 0 ? Math.round((inst.currentStepNumber / inst.totalSteps) * 100) : 0;
                    return (
                      <tr key={inst.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/e2e-flows/${inst.id}`} className="block">
                            <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{inst.id.slice(0, 8)}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  inst.status === "completed" ? "bg-emerald-500" :
                                  inst.status === "failed" ? "bg-rose-500" :
                                  inst.status === "paused_at_gate" ? "bg-amber-500" : "bg-blue-500"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 tabular-nums">{inst.currentStepNumber}/{inst.totalSteps}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-500">{inst.entityType}/{inst.entityId.slice(0, 12)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-500 tabular-nums">{formatRelative(inst.startedAt)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-500 tabular-nums">{formatDuration(inst.startedAt, inst.completedAt)}</span>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <Link
                            href={`/e2e-flows/${inst.id}`}
                            className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900"
                          >
                            Open <ArrowRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
