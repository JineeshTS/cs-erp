"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  User,
  Monitor,
  Copy,
  Edit,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ── Types ──

interface TaskStepDefinition {
  id: string;
  name: string;
  description: string | null;
  stepOrder: number;
  type: string | null;
  role: string | null;
  isOptional: boolean;
  estimatedDurationMinutes: number | null;
}

interface TaskDefinition {
  id: string;
  taskCode: string;
  name: string;
  description: string | null;
  domain: string | null;
  executorType: string | null;
  executorMode: string | null;
  assignedRole: string | null;
  slaHours: string | null;
  aiAssistable: boolean;
}

interface ProcessTaskLink {
  id: string;
  taskOrder: number;
  phase: string | null;
  condition: string | null;
  isParallel: boolean;
  parallelGroup: string | null;
}

interface LinkedTask {
  link: ProcessTaskLink;
  task: TaskDefinition;
}

interface ProcessDefinition {
  id: string;
  processCode: string;
  name: string;
  description: string | null;
  domain: string | null;
  agentName: string | null;
  agentType: string | null;
  automationLevel: string | null;
  triggerType: string | null;
  inputDescription: string | null;
  outputDescription: string | null;
  sla: string | null;
  connectedModules: string[] | null;
  crossDependencies: string[] | null;
  source: string;
  clonedFromId: string | null;
  version: number;
  isPublished: boolean;
  tasks: LinkedTask[];
}

// ── Display config ──

const DOMAIN_LABELS: Record<string, string> = {
  sales_crm: "Sales CRM",
  commercial_pricing: "Commercial Pricing",
  customer_service: "Customer Service",
  operations_documentation: "Operations & Docs",
  freight_invoicing: "Freight Invoicing",
  accounts_receivable: "Accounts Receivable",
  accounts_payable: "Accounts Payable",
  chartering_vessel: "Chartering & Vessel",
  capacity_voyage: "Capacity & Voyage",
  equipment_control: "Equipment Control",
  customs_compliance: "Customs & Compliance",
};

const AUTOMATION_LABELS: Record<string, string> = {
  full_auto: "Full Auto",
  semi_auto: "Semi Auto",
  ai_assisted: "AI Assisted",
  manual_ai_insights: "Manual + AI",
};

const TRIGGER_LABELS: Record<string, string> = {
  event: "Event-Driven",
  scheduled: "Scheduled",
  manual: "Manual",
  api: "API Call",
};

function ExecutorIcon({ type }: { type: string | null }) {
  switch (type) {
    case "ai_agent":
      return <Bot className="h-4 w-4 text-violet-500" />;
    case "human":
      return <User className="h-4 w-4 text-blue-500" />;
    case "system":
    case "external":
      return <Monitor className="h-4 w-4 text-gray-500" />;
    default:
      return <Monitor className="h-4 w-4 text-gray-400" />;
  }
}

// ── Page Component ──

export default function ProcessDefinitionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [process, setProcess] = useState<ProcessDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cloning, setCloning] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const fetchProcess = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/v1/process-definitions/${params.id}`);
      if (!res.ok) {
        const body = await res.json();
        throw new Error(
          body?.error?.message ?? `Failed to load (${res.status})`
        );
      }
      const json = await res.json();
      setProcess(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchProcess();
  }, [fetchProcess]);

  const handleClone = async () => {
    if (!process) return;
    try {
      setCloning(true);
      const csrfMeta = document.querySelector<HTMLMetaElement>(
        'meta[name="csrf-token"]'
      );
      const res = await fetch(
        `/api/v1/process-definitions/${process.id}/clone`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(csrfMeta ? { "X-CSRF-Token": csrfMeta.content } : {}),
          },
        }
      );
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.error?.message ?? "Clone failed");
      }
      const json = await res.json();
      router.push(`/process-definitions/${json.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Clone failed");
    } finally {
      setCloning(false);
    }
  };

  const toggleTask = (taskId: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // ── Error state ──
  if (error || !process) {
    return (
      <div className="space-y-4">
        <Link
          href="/process-definitions"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Process Definitions
        </Link>
        <div className="flex min-h-[300px] items-center justify-center rounded-lg border bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {error ?? "Process not found"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isSystem = process.source === "system";

  // Group tasks by phase
  const phases = new Map<string, LinkedTask[]>();
  for (const lt of process.tasks) {
    const phase = lt.link.phase ?? "General";
    if (!phases.has(phase)) phases.set(phase, []);
    phases.get(phase)!.push(lt);
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <Link
        href="/process-definitions"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Process Definitions
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {process.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{process.processCode}</Badge>
            {process.domain && (
              <Badge variant="info">
                {DOMAIN_LABELS[process.domain] ?? process.domain}
              </Badge>
            )}
            {process.automationLevel && (
              <Badge variant="success">
                {AUTOMATION_LABELS[process.automationLevel] ??
                  process.automationLevel}
              </Badge>
            )}
            <Badge
              variant={isSystem ? "default" : "warning"}
            >
              {process.source}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSystem ? (
            <button
              onClick={handleClone}
              disabled={cloning}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {cloning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              Clone &amp; Customize
            </button>
          ) : (
            <Link
              href={`/process-definitions/${process.id}?edit=true`}
              className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          )}
        </div>
      </div>

      {/* Overview Card */}
      <div className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
          Overview
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {process.description && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Description
              </p>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {process.description}
              </p>
            </div>
          )}
          {process.agentName && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Agent Name
              </p>
              <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {process.agentName}
              </p>
            </div>
          )}
          {process.triggerType && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Trigger Type
              </p>
              <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {TRIGGER_LABELS[process.triggerType] ?? process.triggerType}
              </p>
            </div>
          )}
          {process.sla && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">SLA</p>
              <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {process.sla}
              </p>
            </div>
          )}
          {process.inputDescription && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Input</p>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {process.inputDescription}
              </p>
            </div>
          )}
          {process.outputDescription && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Output
              </p>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {process.outputDescription}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Task Sequence */}
      <div className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
          Task Sequence
          <span className="ms-2 text-sm font-normal text-gray-500">
            ({process.tasks.length} tasks)
          </span>
        </h2>
        {process.tasks.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tasks linked to this process definition.
          </p>
        ) : (
          <div className="space-y-6">
            {Array.from(phases.entries()).map(([phaseName, tasks]) => (
              <div key={phaseName}>
                <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {phaseName}
                </h3>
                <div className="space-y-1">
                  {tasks.map(({ link, task }) => {
                    const isExpanded = expandedTasks.has(task.id);
                    return (
                      <div
                        key={link.id}
                        className="rounded-md border dark:border-gray-600"
                      >
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-start hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            {link.taskOrder}
                          </span>
                          <ExecutorIcon type={task.executorType} />
                          <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                            {task.name}
                          </span>
                          {task.executorType && (
                            <Badge variant="secondary" className="text-[10px]">
                              {task.executorType}
                            </Badge>
                          )}
                          {link.isParallel && (
                            <Badge variant="info" className="text-[10px]">
                              parallel
                            </Badge>
                          )}
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="border-t px-4 py-3 dark:border-gray-600">
                            {task.description && (
                              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                {task.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                              {task.assignedRole && (
                                <span>
                                  Role:{" "}
                                  <strong className="text-gray-700 dark:text-gray-300">
                                    {task.assignedRole}
                                  </strong>
                                </span>
                              )}
                              {task.slaHours && (
                                <span>
                                  SLA:{" "}
                                  <strong className="text-gray-700 dark:text-gray-300">
                                    {task.slaHours}h
                                  </strong>
                                </span>
                              )}
                              {task.executorMode && (
                                <span>
                                  Mode:{" "}
                                  <strong className="text-gray-700 dark:text-gray-300">
                                    {task.executorMode}
                                  </strong>
                                </span>
                              )}
                              <span>
                                AI Assistable:{" "}
                                <strong className="text-gray-700 dark:text-gray-300">
                                  {task.aiAssistable ? "Yes" : "No"}
                                </strong>
                              </span>
                            </div>
                            {link.condition && (
                              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                                Condition: {link.condition}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connected Modules */}
      {process.connectedModules &&
        (process.connectedModules as string[]).length > 0 && (
          <div className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
              Connected Modules
            </h2>
            <div className="flex flex-wrap gap-2">
              {(process.connectedModules as string[]).map((mod) => (
                <Badge key={mod} variant="info">
                  {mod}
                </Badge>
              ))}
            </div>
          </div>
        )}

      {/* Cross Dependencies */}
      {process.crossDependencies &&
        (process.crossDependencies as string[]).length > 0 && (
          <div className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
              Cross Dependencies
            </h2>
            <ul className="space-y-1">
              {(process.crossDependencies as string[]).map((dep) => (
                <li
                  key={dep}
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  <span className="font-mono text-xs text-gray-500">
                    {dep}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Execution History Placeholder */}
      <div className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
          Execution History
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Execution history will be available once process instances are
          created from this definition.
        </p>
      </div>
    </div>
  );
}
