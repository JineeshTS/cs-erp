"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCsrfToken } from "@/lib/client/csrf";
import {
  ArrowLeft,
  ArrowRight,
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
  User,
  Timer,
  ChevronRight,
  Bot,
  Monitor,
  ExternalLink,
  Play,
  Sparkles,
  Check,
  X,
  Database,
  Link2,
  ListChecks,
  ShieldCheck as ShieldCheckIcon,
  FileOutput,
  UserCheck,
} from "lucide-react";
import { E2E_PROCESS_FLOWS } from "@/data/e2e-process-flows";
import { StepInputForm } from "@/components/processes/step-input-form";
import { EntityBindingPanel } from "@/components/processes/entity-binding-panel";

// ── Types ──

interface StepInstance {
  id: string;
  stepNumber: number;
  processRef: string | null;
  stepName: string;
  executorType: string;
  agentId: string | null;
  status: string;
  inputData: Record<string, unknown> | null;
  outputData: Record<string, unknown> | null;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  parallelGroup: string | null;
  createdAt: string;
  // D-006: Entity binding fields
  entityTable?: string | null;
  entityId?: string | null;
  entityAction?: string | null;
  executorMode?: string | null;
}

interface HumanGate {
  id: string;
  stepInstanceId: string;
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

interface FlowDetail {
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
  steps: StepInstance[];
  gates: HumanGate[];
}

// ── Status Config ──

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; icon: typeof Activity }> = {
  active: { bg: "bg-blue-100 dark:bg-blue-900/50", text: "text-blue-700 dark:text-blue-300", label: "Active", icon: Activity },
  paused_at_gate: { bg: "bg-amber-100 dark:bg-amber-900/50", text: "text-amber-700 dark:text-amber-300", label: "At Gate", icon: Pause },
  completed: { bg: "bg-emerald-100 dark:bg-emerald-900/50", text: "text-emerald-700 dark:text-emerald-300", label: "Completed", icon: CheckCircle },
  failed: { bg: "bg-rose-100 dark:bg-rose-900/50", text: "text-rose-700 dark:text-rose-300", label: "Failed", icon: XCircle },
  cancelled: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400", label: "Cancelled", icon: XCircle },
};

const STEP_STATUS_CONFIG: Record<string, { bg: string; text: string; ring: string }> = {
  completed: { bg: "bg-emerald-500", text: "text-white", ring: "ring-emerald-200 dark:ring-emerald-800" },
  in_progress: { bg: "bg-blue-500", text: "text-white", ring: "ring-blue-200 dark:ring-blue-800" },
  pending: { bg: "bg-gray-200 dark:bg-gray-700", text: "text-gray-500 dark:text-gray-400", ring: "ring-gray-100 dark:ring-gray-800" },
  failed: { bg: "bg-rose-500", text: "text-white", ring: "ring-rose-200 dark:ring-rose-800" },
  skipped: { bg: "bg-gray-300 dark:bg-gray-600", text: "text-gray-500 dark:text-gray-400", ring: "ring-gray-100 dark:ring-gray-800" },
  blocked: { bg: "bg-amber-500", text: "text-white", ring: "ring-amber-200 dark:ring-amber-800" },
};

const GATE_TYPE_COLORS: Record<string, string> = {
  approval: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
  decision: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  input: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  exception: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  normal: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const EXECUTOR_ICONS: Record<string, typeof Bot> = {
  ai_agent: Bot,
  ai: Bot,
  human: User,
  system: Monitor,
  external: ExternalLink,
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

function formatSlaRemaining(deadline: string): { text: string; isOverdue: boolean; isWarning: boolean } {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  const isOverdue = diffMs < 0;
  const absDiff = Math.abs(diffMs);

  const hours = Math.floor(absDiff / 3600000);
  const mins = Math.round((absDiff % 3600000) / 60000);

  let text: string;
  if (hours > 0) text = `${hours}h ${mins}m`;
  else text = `${mins}m`;

  if (isOverdue) text = `Overdue by ${text}`;
  else text = `${text} remaining`;

  const isWarning = !isOverdue && diffMs < 1800000; // < 30 min

  return { text, isOverdue, isWarning };
}

function getFlowName(metadata: Record<string, unknown> | null, flowId: string): string {
  if (metadata && typeof metadata.flowName === "string") return metadata.flowName;
  return flowId;
}

// ── Component ──

export default function FlowDetailPage() {
  const params = useParams();
  const flowId = params.id as string;

  const [flow, setFlow] = useState<FlowDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [executing, setExecuting] = useState(false);
  const [aiAssisting, setAiAssisting] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/process-engine/e2e-flows/${flowId}`);
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (res.status === 404) {
        setError("Flow instance not found");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("Failed to load flow details");
        setLoading(false);
        return;
      }
      const body = await res.json();
      setFlow(body.data);
      setError(null);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, [flowId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const toggleStep = (stepNumber: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNumber)) next.delete(stepNumber);
      else next.add(stepNumber);
      return next;
    });
  };

  // Look up flow definition for moduleUrl mapping
  const flowDef = flow ? E2E_PROCESS_FLOWS.find((f) => f.id === flow.e2eFlowId) : null;
  const getModuleUrl = (stepNumber: number, stepStatus?: string): string | undefined => {
    if (!flowDef || !flow) return undefined;
    const stepDef = flowDef.steps[stepNumber - 1];
    if (!stepDef?.moduleUrl) return undefined;
    const params = new URLSearchParams({
      e2eFlowId: flow.e2eFlowId,
      e2eTxId: flow.id,
      e2eStep: String(stepNumber),
      e2eStepName: stepDef.step,
      e2eStepStatus: stepStatus ?? "pending",
      e2eExecutor: stepDef.executorType ?? stepDef.type,
      e2eFlowName: getFlowName(flow.metadata, flow.e2eFlowId),
      e2eTotalSteps: String(flow.totalSteps),
    });
    return `${stepDef.moduleUrl}?${params.toString()}`;
  };

  // Execute current step (auto-chain AI/system steps)
  const handleExecute = async () => {
    if (!flow) return;
    setExecuting(true);
    try {
      const res = await fetch(`/api/v1/process-engine/e2e-flows/${flowId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfToken() },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        alert(`Execution failed: ${err?.error?.message ?? res.statusText}`);
      }
      await fetchData();
    } catch {
      alert("Network error during execution");
    } finally {
      setExecuting(false);
    }
  };

  // AI Assist — generate recommendation without advancing
  const handleAiAssist = async (action: "generate" | "accept" | "reject") => {
    if (!flow) return;
    setAiAssisting(true);
    try {
      const res = await fetch(`/api/v1/process-engine/e2e-flows/${flowId}/ai-assist`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfToken() },
        body: JSON.stringify({ action, stepNumber: flow.currentStepNumber }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        alert(`AI assist failed: ${err?.error?.message ?? res.statusText}`);
      }
      await fetchData();
    } catch {
      alert("Network error during AI assist");
    } finally {
      setAiAssisting(false);
    }
  };

  // Advance step manually (mark current step as complete)
  const handleAdvanceStep = async () => {
    if (!flow) return;
    setAdvancing(true);
    try {
      const res = await fetch(`/api/v1/process-engine/e2e-flows/${flowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfToken() },
        body: JSON.stringify({ output: { completedManually: true, completedAt: new Date().toISOString() } }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        alert(`Advance failed: ${err?.error?.message ?? res.statusText}`);
      }
      await fetchData();
    } catch {
      alert("Network error during advance");
    } finally {
      setAdvancing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !flow) {
    return (
      <div className="space-y-4 p-6">
        <Link href="/e2e-flows" className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400">
          <ArrowLeft className="h-4 w-4" /> Back to E2E Flows
        </Link>
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900 dark:bg-rose-950">
          <XCircle className="mx-auto h-8 w-8 text-rose-400" />
          <p className="mt-2 text-rose-700 dark:text-rose-300">{error ?? "Flow not found"}</p>
        </div>
      </div>
    );
  }

  const statusConf = STATUS_CONFIG[flow.status] ?? STATUS_CONFIG.active;
  const StatusIcon = statusConf.icon;
  const progress = flow.totalSteps > 0 ? Math.round((flow.currentStepNumber / flow.totalSteps) * 100) : 0;

  // Build step→gate map
  const gatesByStep: Record<string, HumanGate[]> = {};
  for (const gate of flow.gates) {
    const key = gate.stepInstanceId;
    if (!gatesByStep[key]) gatesByStep[key] = [];
    gatesByStep[key].push(gate);
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
            <GitBranch className="h-6 w-6 text-blue-500" />
            {getFlowName(flow.metadata, flow.e2eFlowId)}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {flow.entityType} &middot; {flow.entityId} &middot; Triggered by {flow.triggerEvent}
            {flowDef && (
              <>
                {" "}&middot;{" "}
                <Link href={`/e2e-flows/definition/${flow.e2eFlowId}`} className="text-blue-600 hover:underline dark:text-blue-400">
                  View Flow Definition &amp; All Transactions
                </Link>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${statusConf.bg} ${statusConf.text}`}>
            <StatusIcon className="h-4 w-4" />
            {statusConf.label}
          </span>
          <button
            onClick={() => fetchData()}
            className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Progress</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{progress}%</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-full rounded-full transition-all ${
                flow.status === "completed" ? "bg-emerald-500" : flow.status === "failed" ? "bg-rose-500" : "bg-blue-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Step {flow.currentStepNumber} of {flow.totalSteps}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Duration</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {formatDuration(flow.startedAt, flow.completedAt)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Started {formatDateTime(flow.startedAt)}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Human Gates</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{flow.gates.length}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {flow.gates.filter((g) => !g.decision).length} pending
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Steps Completed</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {flow.steps.filter((s) => s.status === "completed").length}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            of {flow.totalSteps} total
          </p>
        </div>
      </div>

      {/* Step Timeline */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Zap className="h-5 w-5 text-blue-500" />
            Step Timeline
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {flow.steps.map((step) => {
            const stepConf = STEP_STATUS_CONFIG[step.status] ?? STEP_STATUS_CONFIG.pending;
            const isCurrentStep = step.stepNumber === flow.currentStepNumber && flow.status !== "completed";
            const ExecutorIcon = EXECUTOR_ICONS[step.executorType] ?? Monitor;
            const stepGates = gatesByStep[step.id] ?? [];
            const isExpanded = expandedSteps.has(step.stepNumber);

            return (
              <div key={step.id} className={isCurrentStep ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}>
                {/* Step Row */}
                <button
                  onClick={() => toggleStep(step.stepNumber)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  {/* Step Number Circle */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${stepConf.bg} ${stepConf.text} ${
                        isCurrentStep ? `ring-2 ${stepConf.ring} ring-offset-1` : ""
                      }`}
                    >
                      {step.status === "completed" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : step.status === "failed" ? (
                        <XCircle className="h-4 w-4" />
                      ) : step.status === "in_progress" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        step.stepNumber
                      )}
                    </div>
                    {/* Connecting line */}
                    {step.stepNumber < flow.totalSteps && (
                      <div className="absolute left-1/2 top-8 h-[calc(100%+4px)] w-0.5 -translate-x-1/2 bg-gray-200 dark:bg-gray-700" />
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {step.stepName}
                      </span>
                      {step.processRef && (
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          {step.processRef}
                        </span>
                      )}
                      {stepGates.length > 0 && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${GATE_TYPE_COLORS[stepGates[0].gateType] ?? ""}`}>
                          {stepGates[0].gateType}
                        </span>
                      )}
                      {isCurrentStep && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <ExecutorIcon className="h-3 w-3" />
                        {step.executorType}
                      </span>
                      {step.startedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(step.startedAt, step.completedAt)}
                        </span>
                      )}
                      {step.parallelGroup && (
                        <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-600 dark:bg-purple-900/50 dark:text-purple-300">
                          parallel: {step.parallelGroup}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${stepConf.bg} ${stepConf.text}`}>
                    {step.status.replace(/_/g, " ")}
                  </span>

                  <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/50">
                    <div className="ml-11 space-y-3">
                      {/* Step Definition (from template) */}
                      {(() => {
                        const stepDef = flowDef?.steps[step.stepNumber - 1];
                        if (!stepDef) return null;
                        return (
                          <>
                            {/* Description + Role + SLA */}
                            {(stepDef.description || stepDef.assignedRole) && (
                              <div className="space-y-1">
                                {stepDef.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{stepDef.description}</p>
                                )}
                                <div className="flex items-center gap-4 text-xs">
                                  {stepDef.assignedRole && (
                                    <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                                      <UserCheck className="h-3 w-3" /> {stepDef.assignedRole}
                                    </span>
                                  )}
                                  {stepDef.slaHours != null && (
                                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                      <Timer className="h-3 w-3" />
                                      SLA: {stepDef.slaHours < 1 ? `${Math.round(stepDef.slaHours * 60)}m` : `${stepDef.slaHours}h`}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Input Data Requirements */}
                            {stepDef.inputFields && stepDef.inputFields.length > 0 && (
                              <div>
                                <h5 className="flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1.5">
                                  <Database className="h-3.5 w-3.5 text-blue-500" />
                                  Required Data ({stepDef.inputFields.length})
                                </h5>
                                <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="bg-gray-100 dark:bg-gray-800">
                                        <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-400">Field</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-400">Source</th>
                                        <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-400">From</th>
                                        <th className="px-2 py-1 text-center font-medium text-gray-600 dark:text-gray-400">Req</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                      {stepDef.inputFields.map((f, fi) => {
                                        // Check if the providing step is completed
                                        const providerDone = f.providedBy?.startsWith("step:")
                                          ? flow.steps.some((s) => s.stepNumber === Number(f.providedBy!.split(":")[1]) && s.status === "completed")
                                          : undefined;
                                        return (
                                          <tr key={fi} className="bg-white dark:bg-gray-900">
                                            <td className="px-2 py-1 font-medium text-gray-900 dark:text-white">{f.field}</td>
                                            <td className="px-2 py-1 text-gray-500 dark:text-gray-400">{f.source}</td>
                                            <td className="px-2 py-1">
                                              {f.providedBy ? (
                                                <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] ${
                                                  providerDone === true
                                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                                    : providerDone === false
                                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                                    : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                                }`}>
                                                  {providerDone === true && <CheckCircle className="h-2.5 w-2.5" />}
                                                  {providerDone === false && <Clock className="h-2.5 w-2.5" />}
                                                  {f.providedBy}
                                                </span>
                                              ) : (
                                                <span className="text-gray-400">—</span>
                                              )}
                                            </td>
                                            <td className="px-2 py-1 text-center">
                                              {f.required ? (
                                                <span className="text-[10px] font-bold text-red-500">YES</span>
                                              ) : (
                                                <span className="text-gray-400">opt</span>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Dependencies with live status */}
                            {stepDef.dependencies && stepDef.dependencies.length > 0 && (
                              <div>
                                <h5 className="flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1.5">
                                  <Link2 className="h-3.5 w-3.5 text-orange-500" />
                                  Dependencies ({stepDef.dependencies.length})
                                </h5>
                                <div className="space-y-1">
                                  {stepDef.dependencies.map((d, di) => {
                                    const depDone = d.ref.startsWith("step:")
                                      ? flow.steps.some((s) => s.stepNumber === Number(d.ref.split(":")[1]) && s.status === "completed")
                                      : undefined;
                                    return (
                                      <div key={di} className="flex items-center gap-2 rounded bg-white px-2 py-1 text-xs dark:bg-gray-900">
                                        {depDone === true ? (
                                          <CheckCircle className="h-3 w-3 shrink-0 text-emerald-500" />
                                        ) : depDone === false ? (
                                          <Clock className="h-3 w-3 shrink-0 text-amber-500" />
                                        ) : (
                                          <Link2 className="h-3 w-3 shrink-0 text-gray-400" />
                                        )}
                                        <span className={`rounded px-1 py-0.5 text-[10px] font-medium uppercase ${
                                          d.type === "hard" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" :
                                          d.type === "soft" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" :
                                          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                        }`}>
                                          {d.type}
                                        </span>
                                        <span className="font-mono text-gray-500 dark:text-gray-400">{d.ref}</span>
                                        <span className="text-gray-600 dark:text-gray-400">{d.label}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Sub-Tasks */}
                            {stepDef.subTasks && stepDef.subTasks.length > 0 && (
                              <div>
                                <h5 className="flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1.5">
                                  <ListChecks className="h-3.5 w-3.5 text-purple-500" />
                                  Sub-Tasks ({stepDef.subTasks.length})
                                </h5>
                                <div className="space-y-0.5">
                                  {stepDef.subTasks.map((st, si) => {
                                    const SubIcon = st.type === "ai" ? Bot : st.type === "human" ? User : Monitor;
                                    return (
                                      <div key={si} className="flex items-start gap-2 rounded bg-white px-2 py-1 text-xs dark:bg-gray-900">
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

                            {/* Output Fields + Validations */}
                            <div className="flex flex-wrap gap-4">
                              {stepDef.outputFields && stepDef.outputFields.length > 0 && (
                                <div className="min-w-0 flex-1">
                                  <h5 className="flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1.5">
                                    <FileOutput className="h-3.5 w-3.5 text-emerald-500" />
                                    Outputs
                                  </h5>
                                  <div className="flex flex-wrap gap-1">
                                    {stepDef.outputFields.map((o, oi) => (
                                      <span key={oi} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                        {o}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {stepDef.validations && stepDef.validations.length > 0 && (
                                <div className="min-w-0 flex-1">
                                  <h5 className="flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1.5">
                                    <ShieldCheckIcon className="h-3.5 w-3.5 text-teal-500" />
                                    Validations
                                  </h5>
                                  <ul className="space-y-0.5">
                                    {stepDef.validations.map((v, vi) => (
                                      <li key={vi} className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
                                        <CheckCircle className="h-2.5 w-2.5 shrink-0 text-teal-500" /> {v}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </>
                        );
                      })()}

                      {/* Step Execution Metadata */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
                        <div>
                          <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Started</span>
                          <p className="text-gray-900 dark:text-white">{formatDateTime(step.startedAt)}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Completed</span>
                          <p className="text-gray-900 dark:text-white">{formatDateTime(step.completedAt)}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Duration</span>
                          <p className="text-gray-900 dark:text-white">
                            {step.durationMs != null ? `${(step.durationMs / 1000).toFixed(1)}s` : formatDuration(step.startedAt, step.completedAt)}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Agent</span>
                          <p className="text-gray-900 dark:text-white">{step.agentId ?? "\u2014"}</p>
                        </div>
                      </div>

                      {/* Output Data */}
                      {step.outputData && Object.keys(step.outputData).length > 0 && (
                        <div>
                          <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Output</span>
                          <pre className="mt-1 max-h-40 overflow-auto rounded-md bg-gray-100 p-2 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {JSON.stringify(step.outputData, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* ── D-006: Entity Bindings (completed steps with real entities) ── */}
                      {step.status === "completed" && step.entityTable && step.entityId && (
                        <EntityBindingPanel
                          bindings={[{
                            bindingId: step.id,
                            entityId: step.entityId,
                            entityTable: step.entityTable,
                            entityAction: step.entityAction ?? "create",
                            entityData: step.outputData?.entityData as Record<string, unknown> ?? step.outputData as Record<string, unknown> ?? null,
                            createdAt: step.completedAt ?? step.createdAt,
                          }]}
                        />
                      )}

                      {/* ── Execution Controls (only on current step) ── */}
                      {isCurrentStep && (flow.status === "active" || flow.status === "paused_at_gate") && (
                        <div className="space-y-3">
                          {/* D-006: Inline Step Form for CRUD/human_form steps */}
                          {(() => {
                            const sd = flowDef?.steps[step.stepNumber - 1];
                            if (!sd?.inputFields?.length || flow.status === "paused_at_gate") return null;
                            return (
                              <StepInputForm
                                flowInstanceId={flow.id}
                                stepNumber={step.stepNumber}
                                stepName={sd.step}
                                inputFields={sd.inputFields}
                                entityTable={sd.entityTable}
                                entityAction={sd.entityAction}
                                onComplete={() => fetchData()}
                              />
                            );
                          })()}

                        <div className="rounded-lg border border-blue-200 bg-blue-50/80 p-3 dark:border-blue-800 dark:bg-blue-950/30">
                          <p className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-300 mb-2">Execute This Step</p>
                          <div className="flex flex-wrap gap-2">
                            {/* Run AI Agent */}
                            <button
                              onClick={handleExecute}
                              disabled={executing || flow.status === "paused_at_gate"}
                              className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-40 dark:bg-blue-500"
                              title="Run AI agent to auto-execute this step"
                            >
                              {executing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bot className="h-3 w-3" />}
                              Run AI Agent
                            </button>

                            {/* AI Assist */}
                            {step.executorType !== "system" && (
                              <>
                                {!(step.inputData as Record<string, unknown> | null)?.["aiAssistResult"] ? (
                                  <button
                                    onClick={() => handleAiAssist("generate")}
                                    disabled={aiAssisting}
                                    className="flex items-center gap-1.5 rounded-md border border-purple-300 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 disabled:opacity-40 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-300"
                                    title="Get AI recommendation without advancing"
                                  >
                                    {aiAssisting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                    AI Assist
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleAiAssist("accept")}
                                      disabled={aiAssisting}
                                      className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
                                    >
                                      {aiAssisting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                      Accept AI Result
                                    </button>
                                    <button
                                      onClick={() => handleAiAssist("reject")}
                                      disabled={aiAssisting}
                                      className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 dark:border-gray-600 dark:text-gray-300"
                                    >
                                      <X className="h-3 w-3" />
                                      Reject
                                    </button>
                                  </>
                                )}
                              </>
                            )}

                            {/* Mark as Complete (manual) */}
                            <button
                              onClick={handleAdvanceStep}
                              disabled={advancing || flow.status === "paused_at_gate"}
                              className="flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              title="Mark this step as completed manually"
                            >
                              {advancing ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                              Mark Complete
                            </button>

                            {/* Open in Module */}
                            {(() => {
                              const moduleUrl = getModuleUrl(step.stepNumber, step.status);
                              if (!moduleUrl) return null;
                              return (
                                <Link
                                  href={moduleUrl}
                                  target="_blank"
                                  className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                  title="Open the module page to do this step manually (new tab)"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Open in Module
                                </Link>
                              );
                            })()}
                          </div>

                          {(() => {
                            const inputData = step.inputData as Record<string, unknown> | null;
                            if (!inputData?.aiAssistResult) return null;
                            return (
                              <div className="mt-2 rounded bg-purple-50 p-2 dark:bg-purple-900/20">
                                <span className="flex items-center gap-1 text-xs font-medium text-purple-700 dark:text-purple-300">
                                  <Sparkles className="h-3 w-3" /> AI Recommendation (review before accepting)
                                </span>
                                <pre className="mt-1 max-h-32 overflow-auto text-xs text-purple-600 dark:text-purple-400">
                                  {JSON.stringify(inputData.aiAssistResult, null, 2)}
                                </pre>
                              </div>
                            );
                          })()}
                        </div>
                        </div>
                      )}

                      {/* ── Module Link for non-current steps ── */}
                      {!isCurrentStep && (() => {
                        const moduleUrl = getModuleUrl(step.stepNumber, step.status);
                        if (!moduleUrl) return null;
                        return (
                          <Link
                            href={moduleUrl}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline dark:text-blue-400"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View in {flowDef?.steps[step.stepNumber - 1]?.module ?? "Module"}
                          </Link>
                        );
                      })()}

                      {/* Human Gates for this step */}
                      {stepGates.map((gate) => (
                        <GateCard key={gate.id} gate={gate} onResolved={fetchData} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {flow.steps.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            No step instances created yet.
          </div>
        )}
      </div>

      {/* Flow Events / Metadata */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Flow Metadata</h3>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Flow ID</dt>
            <dd className="font-mono text-gray-900 dark:text-white">{flow.e2eFlowId}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Instance ID</dt>
            <dd className="truncate font-mono text-gray-900 dark:text-white" title={flow.id}>{flow.id}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Entity</dt>
            <dd className="text-gray-900 dark:text-white">{flow.entityType} / {flow.entityId}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Trigger Event</dt>
            <dd className="text-gray-900 dark:text-white">{flow.triggerEvent}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Started</dt>
            <dd className="text-gray-900 dark:text-white">{formatDateTime(flow.startedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Completed</dt>
            <dd className="text-gray-900 dark:text-white">{formatDateTime(flow.completedAt)}</dd>
          </div>
          {flow.parentFlowInstanceId && (
            <div>
              <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Parent Flow</dt>
              <dd>
                <Link
                  href={`/e2e-flows/${flow.parentFlowInstanceId}`}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {flow.parentFlowInstanceId}
                </Link>
              </dd>
            </div>
          )}
        </dl>
        {flow.metadata && Object.keys(flow.metadata).length > 0 && (
          <div className="mt-3">
            <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Extra Metadata</span>
            <pre className="mt-1 max-h-32 overflow-auto rounded-md bg-gray-100 p-2 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {JSON.stringify(flow.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Gate Card Component (with inline approve/reject/input controls) ──

function GateCard({ gate, onResolved }: { gate: HumanGate; onResolved?: () => void }) {
  const sla = formatSlaRemaining(gate.slaDeadline);
  const isResolved = gate.decision != null;
  const [resolving, setResolving] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [additionalInput, setAdditionalInput] = useState("");

  const resolveGate = async (decision: string) => {
    setResolving(true);
    setGateError(null);
    try {
      const decisionData: Record<string, unknown> = {};
      if (comment.trim()) decisionData.comment = comment.trim();
      if (additionalInput.trim()) decisionData.additionalInput = additionalInput.trim();

      const res = await fetch(`/api/v1/process-engine/human-gates/${gate.id}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        body: JSON.stringify({ decision, decisionData: Object.keys(decisionData).length > 0 ? decisionData : undefined }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message ?? `Failed (${res.status})`);
      }
      onResolved?.();
    } catch (err) {
      setGateError(err instanceof Error ? err.message : "Resolution failed");
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className={`rounded-lg border p-3 ${
      isResolved
        ? "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
        : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Human Gate
          </span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${GATE_TYPE_COLORS[gate.gateType] ?? ""}`}>
            {gate.gateType}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[gate.priority] ?? ""}`}>
            {gate.priority}
          </span>
        </div>
        {isResolved ? (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            gate.decision === "approved"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
              : "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
          }`}>
            {gate.autoApproved ? "Auto-" : ""}{gate.decision}
          </span>
        ) : (
          <span className={`text-xs font-medium ${
            sla.isOverdue ? "text-red-600 dark:text-red-400" : sla.isWarning ? "text-amber-600 dark:text-amber-400" : "text-gray-500 dark:text-gray-400"
          }`}>
            <Timer className="mr-1 inline h-3 w-3" />
            {sla.text}
          </span>
        )}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Assigned to:</span>
          <span className="ml-1 text-gray-900 dark:text-white">{gate.assignedToRole}</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">SLA Deadline:</span>
          <span className="ml-1 text-gray-900 dark:text-white">{formatDateTime(gate.slaDeadline)}</span>
        </div>
        {gate.escalationToRole && (
          <div>
            <span className="text-gray-500 dark:text-gray-400">Escalation:</span>
            <span className="ml-1 text-gray-900 dark:text-white">{gate.escalationToRole}</span>
          </div>
        )}
        {gate.decidedAt && (
          <div>
            <span className="text-gray-500 dark:text-gray-400">Decided:</span>
            <span className="ml-1 text-gray-900 dark:text-white">{formatDateTime(gate.decidedAt)}</span>
          </div>
        )}
      </div>

      {/* AI Recommendation */}
      {gate.aiRecommendation && Object.keys(gate.aiRecommendation).length > 0 && (
        <div className="mt-2 rounded bg-blue-50 p-2 dark:bg-blue-900/20">
          <span className="flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-300">
            <Bot className="h-3 w-3" /> AI Recommendation
          </span>
          <div className="mt-1 space-y-0.5 text-xs text-blue-600 dark:text-blue-400">
            {Object.entries(gate.aiRecommendation).map(([k, v]) => (
              <div key={k}>
                <span className="font-medium">{k.replace(/([A-Z])/g, " $1").trim()}:</span>{" "}
                {typeof v === "object" ? JSON.stringify(v) : String(v)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Presented Info (context for decision) */}
      {gate.presentedInfo && Object.keys(gate.presentedInfo).length > 0 && (
        <div className="mt-2 rounded bg-gray-50 p-2 dark:bg-gray-800/50">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Context</span>
          <div className="mt-1 space-y-0.5 text-xs text-gray-700 dark:text-gray-300">
            {Object.entries(gate.presentedInfo).map(([k, v]) => (
              <div key={k}>
                <span className="font-medium">{k.replace(/([A-Z])/g, " $1").trim()}:</span>{" "}
                {typeof v === "object" ? JSON.stringify(v) : String(v)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Data (when resolved) */}
      {isResolved && gate.decisionData && Object.keys(gate.decisionData).length > 0 && (
        <div className="mt-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Decision Notes</span>
          <div className="mt-1 space-y-0.5 text-xs text-gray-700 dark:text-gray-300">
            {Object.entries(gate.decisionData).map(([k, v]) => (
              <div key={k}>
                <span className="font-medium">{k}:</span> {String(v)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Action Controls (only for unresolved gates) ── */}
      {!isResolved && (
        <div className="mt-3 space-y-2 border-t border-amber-200 pt-3 dark:border-amber-800">
          {/* Comment / Notes input */}
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {gate.gateType === "input" ? "Your Input" : "Notes / Comment"}{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={gate.gateType === "input" ? additionalInput : comment}
              onChange={(e) => gate.gateType === "input" ? setAdditionalInput(e.target.value) : setComment(e.target.value)}
              rows={2}
              placeholder={
                gate.gateType === "input"
                  ? "Provide the requested information..."
                  : gate.gateType === "exception"
                  ? "Describe the resolution or escalation reason..."
                  : "Add notes for your decision..."
              }
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Action Buttons — vary by gate type */}
          <div className="flex flex-wrap items-center gap-2">
            {gate.gateType === "approval" && (
              <>
                <button
                  onClick={() => resolveGate("approved")}
                  disabled={resolving}
                  className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {resolving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Approve
                </button>
                <button
                  onClick={() => resolveGate("rejected")}
                  disabled={resolving}
                  className="flex items-center gap-1.5 rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
              </>
            )}

            {gate.gateType === "decision" && (
              <>
                <button
                  onClick={() => resolveGate("approved")}
                  disabled={resolving}
                  className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {resolving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Qualify / Accept
                </button>
                <button
                  onClick={() => resolveGate("rejected")}
                  disabled={resolving}
                  className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                >
                  <X className="h-4 w-4" />
                  Decline / Defer
                </button>
              </>
            )}

            {gate.gateType === "input" && (
              <button
                onClick={() => resolveGate("input_provided")}
                disabled={resolving || !additionalInput.trim()}
                className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {resolving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Submit Input
              </button>
            )}

            {gate.gateType === "exception" && (
              <>
                <button
                  onClick={() => resolveGate("approved")}
                  disabled={resolving}
                  className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {resolving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Resolve Exception
                </button>
                <button
                  onClick={() => resolveGate("rejected")}
                  disabled={resolving}
                  className="flex items-center gap-1.5 rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Escalate
                </button>
              </>
            )}

            {/* Fallback for unknown gate types */}
            {!["approval", "decision", "input", "exception"].includes(gate.gateType) && (
              <>
                <button
                  onClick={() => resolveGate("approved")}
                  disabled={resolving}
                  className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {resolving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Approve
                </button>
                <button
                  onClick={() => resolveGate("rejected")}
                  disabled={resolving}
                  className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
              </>
            )}
          </div>

          {gateError && (
            <div className="flex items-center gap-1.5 rounded bg-rose-50 px-3 py-1.5 text-xs text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              {gateError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
