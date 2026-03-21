"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
// INLINE: bypass Turbopack stale import cache (CSERP-001)
function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  for (const c of document.cookie.split("; ")) {
    const [n, ...v] = c.split("=");
    if (n === "cs_csrf") return decodeURIComponent(v.join("="));
  }
  return "";
}
import {
  ArrowLeft,
  Bot,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  X,
  XCircle,
  Zap,
} from "lucide-react";

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
}

interface GateInstance {
  id: string;
  stepInstanceId: string;
  gateType: string;
  assignedToRole: string;
  priority: string;
  decision: string | null;
  decisionData: Record<string, unknown> | null;
  aiRecommendation: Record<string, unknown> | null;
  slaDeadline: string;
  decidedAt: string | null;
  autoApproved: boolean;
}

interface FlowInstance {
  id: string;
  e2eFlowId: string;
  entityType: string;
  entityId: string;
  status: string;
  currentStepNumber: number;
  totalSteps: number;
  metadata: Record<string, unknown> | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  steps: StepInstance[];
  gates: GateInstance[];
}

// ── Helpers ──

const STATUS_COLORS: Record<string, string> = {
  pending: "border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400",
  in_progress: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
  completed: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
  failed: "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-600 dark:bg-rose-900/30 dark:text-rose-300",
  skipped: "border-gray-300 bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400",
  blocked: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
};

const FLOW_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" },
  paused_at_gate: { label: "Paused at Gate", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" },
  failed: { label: "Failed", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300" },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
};

function formatDuration(ms: number | null): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
  return `${Math.floor(ms / 3600000)}h ${Math.round((ms % 3600000) / 60000)}m`;
}

// getCsrfToken imported from @/lib/client/csrf (BUG-002 fix)

// ── Main Page ──

export default function FlowInstanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [flow, setFlow] = useState<FlowInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  // AI Assist state
  const [aiAssistLoading, setAiAssistLoading] = useState(false);
  const [aiAssistResult, setAiAssistResult] = useState<Record<string, unknown> | null>(null);
  const [aiAssistStep, setAiAssistStep] = useState<number | null>(null);
  const [aiAcceptLoading, setAiAcceptLoading] = useState(false);

  const fetchFlow = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/process-engine/e2e-flows/${id}`);
      if (res.status === 401) { router.push("/login"); return; }
      if (!res.ok) { setError("Failed to load flow instance"); return; }
      const body = await res.json();
      setFlow(body.data);
      setError(null);
    } catch {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchFlow();
    const interval = setInterval(fetchFlow, 5000);
    return () => clearInterval(interval);
  }, [fetchFlow]);

  // ── AI Assist Actions ──

  async function handleAiGenerate(stepNumber: number) {
    setAiAssistLoading(true);
    setAiAssistStep(stepNumber);
    setAiAssistResult(null);
    try {
      const res = await fetch(`/api/v1/process-engine/e2e-flows/${id}/ai-assist`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": getCsrfToken() },
        body: JSON.stringify({ action: "generate", stepNumber }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error?.message ?? "AI assist failed");
        return;
      }
      setAiAssistResult(body.data?.aiResult ?? null);
      setExpandedStep(stepNumber);
    } catch {
      setError("AI assist request failed");
    } finally {
      setAiAssistLoading(false);
    }
  }

  async function handleAiAccept(stepNumber: number) {
    setAiAcceptLoading(true);
    try {
      const res = await fetch(`/api/v1/process-engine/e2e-flows/${id}/ai-assist`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": getCsrfToken() },
        body: JSON.stringify({ action: "accept", stepNumber }),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error?.message ?? "Accept failed");
        return;
      }
      setAiAssistResult(null);
      setAiAssistStep(null);
      await fetchFlow();
    } catch {
      setError("Accept request failed");
    } finally {
      setAiAcceptLoading(false);
    }
  }

  async function handleAiReject(stepNumber: number) {
    try {
      await fetch(`/api/v1/process-engine/e2e-flows/${id}/ai-assist`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": getCsrfToken() },
        body: JSON.stringify({ action: "reject", stepNumber }),
      });
      setAiAssistResult(null);
      setAiAssistStep(null);
      await fetchFlow();
    } catch {
      // silent
    }
  }

  // ── Render ──

  if (loading && !flow) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !flow) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-800 dark:bg-rose-950">
        <XCircle className="mx-auto h-8 w-8 text-rose-500" />
        <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">{error}</p>
        <button onClick={() => { setError(null); setLoading(true); fetchFlow(); }} className="mt-3 text-sm font-medium text-rose-600 hover:underline">
          Retry
        </button>
      </div>
    );
  }

  if (!flow) return null;

  const flowStatus = FLOW_STATUS_LABELS[flow.status] ?? FLOW_STATUS_LABELS.active;
  const pct = flow.totalSteps > 0 ? Math.round((flow.currentStepNumber / flow.totalSteps) * 100) : 0;
  const flowName = (flow.metadata?.flowName as string) ?? flow.e2eFlowId;

  // Find the current step and check if it has a pending AI assist result
  const currentStep = flow.steps.find((s) => s.stepNumber === flow.currentStepNumber);
  const currentStepHasAiAssist = currentStep?.inputData && "aiAssistResult" in (currentStep.inputData ?? {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/processes/monitor" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{flowName}</h1>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${flowStatus.color}`}>
              {flowStatus.label}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {flow.e2eFlowId} &middot; {flow.entityType} {flow.entityId.slice(0, 8)}&hellip; &middot; Step {flow.currentStepNumber}/{flow.totalSteps}
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchFlow(); }}
          className="rounded-md border border-slate-200 dark:border-slate-700 p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="rounded-lg border border-slate-200/60 bg-white p-4 dark:border-slate-700/60 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Flow Progress</span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{pct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              flow.status === "completed" ? "bg-emerald-500" :
              flow.status === "failed" ? "bg-rose-500" :
              flow.status === "paused_at_gate" ? "bg-amber-500" :
              "bg-blue-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-800 dark:bg-rose-950">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500" />
          <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
          <button onClick={() => setError(null)} className="ms-auto"><X className="h-3 w-3 text-rose-400" /></button>
        </div>
      )}

      {/* Step Timeline */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Steps</h2>
        {flow.steps
          .sort((a, b) => a.stepNumber - b.stepNumber)
          .map((step) => {
            const isCurrent = step.stepNumber === flow.currentStepNumber;
            const isExpanded = expandedStep === step.stepNumber;
            const statusColor = STATUS_COLORS[step.status] ?? STATUS_COLORS.pending;
            const gate = flow.gates.find((g) => g.stepInstanceId === step.id);
            const stepInputData = step.inputData as Record<string, unknown> | null;
            const hasAiResult = stepInputData && "aiAssistResult" in (stepInputData ?? {});
            const isAiAssistTarget = aiAssistStep === step.stepNumber;

            // Can we show the "Run AI Agent" button?
            const canAiAssist =
              isCurrent &&
              (flow.status === "active" || flow.status === "paused_at_gate") &&
              (step.status === "in_progress" || step.status === "pending") &&
              !aiAssistLoading;

            return (
              <div
                key={step.id}
                className={`rounded-lg border transition-all ${
                  isCurrent ? "border-blue-300 dark:border-blue-600 ring-1 ring-blue-100 dark:ring-blue-900/30" : "border-slate-200/60 dark:border-slate-700/60"
                } bg-white dark:bg-slate-900`}
              >
                {/* Step Header */}
                <button
                  onClick={() => setExpandedStep(isExpanded ? null : step.stepNumber)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-start"
                >
                  {/* Step number circle */}
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${statusColor}`}>
                    {step.status === "completed" ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : step.status === "failed" ? (
                      <X className="h-3.5 w-3.5" />
                    ) : step.status === "in_progress" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      step.stepNumber
                    )}
                  </div>

                  {/* Step info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isCurrent ? "text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-300"}`}>
                        {step.stepName}
                      </span>
                      {/* Executor badge */}
                      <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        step.executorType === "ai_agent" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" :
                        step.executorType === "human" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" :
                        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {step.executorType === "ai_agent" ? <Bot className="h-2.5 w-2.5" /> :
                         step.executorType === "human" ? <ShieldAlert className="h-2.5 w-2.5" /> :
                         <Zap className="h-2.5 w-2.5" />}
                        {step.executorType === "ai_agent" ? "AI" : step.executorType === "human" ? "Human" : "System"}
                      </span>
                      {/* Gate badge */}
                      {gate && (
                        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          gate.decision ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" :
                          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        }`}>
                          <Pause className="h-2.5 w-2.5 me-0.5" />
                          {gate.decision ? `Gate: ${gate.decision}` : "Gate: Pending"}
                        </span>
                      )}
                      {/* AI Assist indicator */}
                      {hasAiResult && (
                        <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                          <Sparkles className="h-2.5 w-2.5 me-0.5" />
                          AI Ready
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-400 dark:text-slate-500">{step.processRef ?? "—"}</span>
                      {step.durationMs != null && (
                        <span className="text-xs text-slate-400"><Clock className="inline h-3 w-3 me-0.5" />{formatDuration(step.durationMs)}</span>
                      )}
                    </div>
                  </div>

                  {/* Right side: AI Assist button + expand */}
                  <div className="flex items-center gap-2">
                    {canAiAssist && !hasAiResult && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAiGenerate(step.stepNumber); }}
                        disabled={aiAssistLoading}
                        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        {isAiAssistTarget && aiAssistLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                        Run AI Agent
                      </button>
                    )}
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">
                    {/* AI Assist Result Panel */}
                    {(hasAiResult || (isAiAssistTarget && aiAssistResult)) && (
                      <div className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-700 dark:bg-indigo-950/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">AI Agent Output</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAiAccept(step.stepNumber)}
                              disabled={aiAcceptLoading}
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                            >
                              {aiAcceptLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                              Accept & Continue
                            </button>
                            <button
                              onClick={() => handleAiReject(step.stepNumber)}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                            >
                              <X className="h-3 w-3" />
                              Reject
                            </button>
                          </div>
                        </div>
                        <AiResultDisplay result={isAiAssistTarget && aiAssistResult ? aiAssistResult : (stepInputData?.aiAssistResult as Record<string, unknown>)} />
                      </div>
                    )}

                    {/* Step Output (for completed steps) */}
                    {step.outputData && Object.keys(step.outputData).length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Output</span>
                        <AiResultDisplay result={step.outputData} />
                      </div>
                    )}

                    {/* Gate details */}
                    {gate && (
                      <div className="mt-3 rounded border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-700 dark:bg-amber-950/30">
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase">Gate: {gate.gateType}</span>
                        <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <div>Role: <strong>{gate.assignedToRole}</strong></div>
                          <div>Priority: <strong>{gate.priority}</strong></div>
                          <div>Decision: <strong>{gate.decision ?? "Pending"}</strong></div>
                          <div>Auto-approved: <strong>{gate.autoApproved ? "Yes" : "No"}</strong></div>
                        </div>
                        {gate.aiRecommendation && Object.keys(gate.aiRecommendation).length > 0 && (
                          <div className="mt-2">
                            <span className="text-[10px] font-semibold text-amber-600 uppercase">AI Recommendation</span>
                            <pre className="mt-1 whitespace-pre-wrap text-xs text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 rounded p-2 overflow-x-auto">
                              {JSON.stringify(gate.aiRecommendation, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Empty state for pending steps */}
                    {!step.outputData && !hasAiResult && !(isAiAssistTarget && aiAssistResult) && !gate && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                        {step.status === "pending" ? "This step hasn't started yet." :
                         step.status === "in_progress" ? "This step is in progress. Click \"Run AI Agent\" to generate AI output." :
                         "No output data."}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Flow Metadata */}
      <div className="rounded-lg border border-slate-200/60 bg-white p-4 dark:border-slate-700/60 dark:bg-slate-900">
        <h3 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">Flow Details</h3>
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400 sm:grid-cols-4">
          <div>
            <span className="text-slate-400 dark:text-slate-500">Flow ID</span>
            <p className="font-mono font-medium">{flow.e2eFlowId}</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500">Instance ID</span>
            <p className="font-mono font-medium truncate">{flow.id.slice(0, 12)}&hellip;</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500">Entity</span>
            <p className="font-medium">{flow.entityType}</p>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500">Created</span>
            <p className="font-medium">{new Date(flow.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AI Result Display Component ──

function AiResultDisplay({ result }: { result: Record<string, unknown> | null | undefined }) {
  if (!result) return null;

  const summary = typeof result.summary === "string" ? result.summary : null;
  const decisions = Array.isArray(result.decisions) ? result.decisions : [];
  const findings = Array.isArray(result.findings) ? result.findings : [];
  const risks = Array.isArray(result.risks) ? result.risks : [];
  const followUp = Array.isArray(result.followUp) ? result.followUp : [];
  const data = typeof result.data === "object" && result.data !== null ? result.data : null;

  // If it's a simple object without standard fields, show as JSON
  if (!summary && decisions.length === 0 && findings.length === 0) {
    return (
      <pre className="whitespace-pre-wrap text-xs text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 rounded p-2 overflow-x-auto max-h-64">
        {JSON.stringify(result, null, 2)}
      </pre>
    );
  }

  return (
    <div className="space-y-2 text-xs">
      {summary && (
        <p className="text-slate-700 dark:text-slate-300">{summary}</p>
      )}
      {decisions.length > 0 && (
        <div>
          <span className="font-semibold text-slate-500 dark:text-slate-400">Decisions:</span>
          <ul className="mt-0.5 list-disc list-inside text-slate-600 dark:text-slate-400">
            {decisions.map((d, i) => <li key={i}>{String(d)}</li>)}
          </ul>
        </div>
      )}
      {findings.length > 0 && (
        <div>
          <span className="font-semibold text-slate-500 dark:text-slate-400">Findings:</span>
          <ul className="mt-0.5 list-disc list-inside text-slate-600 dark:text-slate-400">
            {findings.map((f, i) => <li key={i}>{String(f)}</li>)}
          </ul>
        </div>
      )}
      {risks.length > 0 && (
        <div>
          <span className="font-semibold text-rose-500 dark:text-rose-400">Risks:</span>
          <ul className="mt-0.5 list-disc list-inside text-rose-600 dark:text-rose-400">
            {risks.map((r, i) => <li key={i}>{String(r)}</li>)}
          </ul>
        </div>
      )}
      {followUp.length > 0 && (
        <div>
          <span className="font-semibold text-slate-500 dark:text-slate-400">Follow-up:</span>
          <ul className="mt-0.5 list-disc list-inside text-slate-600 dark:text-slate-400">
            {followUp.map((f, i) => <li key={i}>{String(f)}</li>)}
          </ul>
        </div>
      )}
      {data && Object.keys(data).length > 0 && (
        <details className="mt-1">
          <summary className="cursor-pointer text-[10px] font-semibold text-slate-400 uppercase hover:text-slate-600 dark:hover:text-slate-300">Data</summary>
          <pre className="mt-1 whitespace-pre-wrap text-[10px] text-slate-500 dark:text-slate-500 bg-white/50 dark:bg-slate-900/50 rounded p-2 overflow-x-auto max-h-40">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
