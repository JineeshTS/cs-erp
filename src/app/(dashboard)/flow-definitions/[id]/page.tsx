"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  GitBranch,
  ArrowLeft,
  Copy,
  Edit3,
  Loader2,
  ShieldCheck,
  Zap,
  Clock,
  Target,
  Users,
  Bot,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Layers,
  Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ── Types ──

interface FlowStep {
  id: string;
  stepOrder: number;
  stepName: string | null;
  phase: string | null;
  module: string | null;
  moduleUrl: string | null;
  condition: string | null;
  isParallel: boolean;
  parallelGroup: string | null;
  process: {
    id: string;
    processCode: string;
    name: string;
    domain: string | null;
    agentName: string | null;
    agentType: string | null;
    automationLevel: string | null;
    tasks: {
      id: string;
      taskCode: string;
      name: string;
      taskOrder: number;
      executorType: string | null;
      executorMode: string | null;
      gateType: string | null;
      assignedRole: string | null;
    }[];
  } | null;
  task: {
    id: string;
    taskCode: string;
    name: string;
    executorType: string | null;
    executorMode: string | null;
    gateType: string | null;
    assignedRole: string | null;
    slaHours: string | null;
  } | null;
}

interface FlowDefinition {
  id: string;
  flowCode: string;
  name: string;
  description: string | null;
  category: string | null;
  triggerEvent: string | null;
  entityType: string | null;
  source: string;
  version: number;
  isPublished: boolean;
  participatingModules: string[] | null;
  aiAgents: string[] | null;
  handoffPoints: string[] | null;
  typicalTimeline: string | null;
  kpis: string[] | null;
  humanGates: string[] | null;
  conditionalBranches: string[] | null;
  childFlows: string[] | null;
  clonedFromId: string | null;
  createdAt: string;
  updatedAt: string;
  steps: FlowStep[];
}

// ── Category Config ──

const CATEGORY_COLORS: Record<string, string> = {
  revenue_cycle: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  vessel_operations: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  container_management: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  financial_operations: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  compliance_regulatory: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  fleet_asset: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
  hr_crew: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  platform_admin: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

function getCategoryLabel(cat: string | null): string {
  if (!cat) return "Uncategorized";
  return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Executor Mode Labels ──

const MODE_LABELS: Record<string, { label: string; color: string }> = {
  crud: { label: "CRUD", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" },
  ai_with_tools: { label: "AI + Tools", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300" },
  gate: { label: "Gate", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" },
  human_form: { label: "Human Form", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300" },
};

// ── Main Component ──

export default function FlowDefinitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const flowId = params.id as string;
  const action = searchParams.get("action");

  const [flow, setFlow] = useState<FlowDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cloning, setCloning] = useState(false);
  const [expandedProcesses, setExpandedProcesses] = useState<Set<string>>(new Set());

  const fetchFlow = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/flow-definitions/${flowId}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error?.message ?? "Failed to load flow definition");
        return;
      }
      const json = await res.json();
      setFlow(json.data);
    } catch {
      setError("Failed to fetch flow definition");
    } finally {
      setLoading(false);
    }
  }, [flowId]);

  useEffect(() => {
    fetchFlow();
  }, [fetchFlow]);

  // Handle clone action from URL param
  useEffect(() => {
    if (action === "clone" && flow && !cloning) {
      handleClone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, flow]);

  async function handleClone() {
    if (cloning) return;
    setCloning(true);
    try {
      const csrfCookie = document.cookie
        .split("; ")
        .find((c) => c.startsWith("cs_csrf="))
        ?.split("=")[1];

      const res = await fetch(`/api/v1/flow-definitions/${flowId}/clone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfCookie ? { "X-CSRF-Token": csrfCookie } : {}),
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error?.message ?? "Failed to clone flow");
        return;
      }

      const json = await res.json();
      router.push(`/flow-definitions/${json.data.id}`);
    } catch {
      setError("Failed to clone flow definition");
    } finally {
      setCloning(false);
    }
  }

  function toggleProcess(processId: string) {
    setExpandedProcesses((prev) => {
      const next = new Set(prev);
      if (next.has(processId)) {
        next.delete(processId);
      } else {
        next.add(processId);
      }
      return next;
    });
  }

  // ── Loading State ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-500 dark:text-gray-400">Loading flow definition...</span>
      </div>
    );
  }

  // ── Error State ──
  if (error || !flow) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {error ?? "Flow definition not found"}
        </h3>
        <Link
          href="/flow-definitions"
          className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Back to Flow Definitions
        </Link>
      </div>
    );
  }

  const isSystem = flow.source === "system";
  const categoryColor = CATEGORY_COLORS[flow.category ?? ""] ?? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Header */}
      <div>
        <Link
          href="/flow-definitions"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Flow Definitions
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {flow.name}
              </h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColor}`}>
                {getCategoryLabel(flow.category)}
              </span>
              <Badge variant={isSystem ? "info" : "success"}>
                {flow.source}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-xs font-mono">
                {flow.flowCode}
              </code>
              <span className="mx-2">v{flow.version}</span>
              {flow.isPublished ? (
                <span className="text-emerald-600 dark:text-emerald-400">Published</span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">Draft</span>
              )}
            </p>
          </div>

          <div className="flex gap-2">
            {isSystem && (
              <button
                onClick={handleClone}
                disabled={cloning}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {cloning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Clone & Customize
              </button>
            )}
            {!isSystem && (
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                onClick={() => {
                  /* Future: open edit modal */
                }}
              >
                <Edit3 className="h-4 w-4" />
                Edit Flow
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {flow.description && (
          <div className="md:col-span-2 lg:col-span-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">{flow.description}</p>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Trigger Event</h3>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {flow.triggerEvent ?? "Manual"}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Entity Type</h3>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {flow.entityType ?? "N/A"}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-purple-500" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Timeline</h3>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {flow.typicalTimeline ?? "N/A"}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Steps</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {flow.steps.length}
          </p>
        </div>
      </div>

      {/* KPIs */}
      {flow.kpis && flow.kpis.length > 0 && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Key Performance Indicators
          </h3>
          <div className="flex flex-wrap gap-2">
            {flow.kpis.map((kpi, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 text-xs font-medium"
              >
                <Activity className="mr-1 h-3 w-3" />
                {kpi}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Process Pipeline */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-blue-500" />
          Process Pipeline
        </h2>

        {flow.steps.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
            <Layers className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No steps linked to this flow yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {flow.steps.map((step, idx) => {
              const isGate = step.task?.gateType || step.task?.executorMode === "gate";
              const isExpanded = step.process
                ? expandedProcesses.has(step.process.id)
                : false;

              return (
                <div key={step.id} className="relative">
                  {/* Connector line */}
                  {idx > 0 && (
                    <div className="absolute left-6 -top-3 w-0.5 h-3 bg-gray-300 dark:bg-gray-600" />
                  )}

                  <div
                    className={`rounded-lg border ${
                      isGate
                        ? "border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/20"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    } p-4`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Step number */}
                      <div
                        className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                          isGate
                            ? "bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200"
                            : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                        }`}
                      >
                        {step.stepOrder}
                      </div>

                      {/* Gate icon */}
                      {isGate && (
                        <ShieldCheck className="h-5 w-5 text-amber-500 flex-shrink-0" />
                      )}

                      {/* Step info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {step.process && (
                            <button
                              onClick={() => toggleProcess(step.process!.id)}
                              className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <code className="text-xs bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5 font-mono">
                                {step.process.processCode}
                              </code>
                              <span>{step.process.name}</span>
                            </button>
                          )}
                          {step.task && !step.process && (
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {step.task.name}
                            </span>
                          )}
                          {step.stepName && !step.process && !step.task && (
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {step.stepName}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {step.module && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {step.module}
                            </span>
                          )}
                          {step.phase && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              Phase: {step.phase}
                            </span>
                          )}
                          {step.isParallel && (
                            <Badge variant="info">Parallel</Badge>
                          )}
                          {step.condition && (
                            <Badge variant="warning">Conditional</Badge>
                          )}
                          {/* Executor mode badges */}
                          {step.task?.executorMode && MODE_LABELS[step.task.executorMode] && (
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                MODE_LABELS[step.task.executorMode].color
                              }`}
                            >
                              {MODE_LABELS[step.task.executorMode].label}
                            </span>
                          )}
                          {step.task?.gateType && (
                            <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-xs font-medium">
                              <ShieldCheck className="mr-1 h-3 w-3" />
                              {step.task.gateType}
                            </span>
                          )}
                          {step.process?.automationLevel && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {step.process.automationLevel.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded process tasks */}
                    {step.process && isExpanded && step.process.tasks.length > 0 && (
                      <div className="mt-3 ml-11 border-l-2 border-gray-200 dark:border-gray-600 pl-4 space-y-2">
                        {step.process.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span className="flex-shrink-0 w-5 h-5 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-mono">
                              {task.taskOrder}
                            </span>
                            <code className="text-gray-400 dark:text-gray-500 font-mono">
                              {task.taskCode}
                            </code>
                            <span className="text-gray-700 dark:text-gray-300">
                              {task.name}
                            </span>
                            {task.executorMode && MODE_LABELS[task.executorMode] && (
                              <span
                                className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                                  MODE_LABELS[task.executorMode].color
                                }`}
                              >
                                {MODE_LABELS[task.executorMode].label}
                              </span>
                            )}
                            {task.gateType && (
                              <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 text-[10px] font-medium">
                                <ShieldCheck className="mr-0.5 h-2.5 w-2.5" />
                                {task.gateType}
                              </span>
                            )}
                            {task.assignedRole && (
                              <span className="text-gray-400 dark:text-gray-500">
                                ({task.assignedRole})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Participating Modules */}
      {flow.participatingModules && flow.participatingModules.length > 0 && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Participating Modules
          </h3>
          <div className="flex flex-wrap gap-2">
            {flow.participatingModules.map((mod, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 text-xs font-medium"
              >
                {mod}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Agents */}
      {flow.aiAgents && flow.aiAgents.length > 0 && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Agents
          </h3>
          <div className="flex flex-wrap gap-2">
            {flow.aiAgents.map((agent, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 text-xs font-medium"
              >
                <Bot className="mr-1 h-3 w-3" />
                {agent}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Human Gates */}
      {flow.humanGates && flow.humanGates.length > 0 && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Human Gates
          </h3>
          <div className="flex flex-wrap gap-2">
            {flow.humanGates.map((gate, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 text-xs font-medium"
              >
                <ShieldCheck className="mr-1 h-3 w-3" />
                {gate}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
