"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Pencil,
  Loader2,
  Clock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { getCsrfToken } from "@/lib/client/csrf";

// ── Types ──

interface TaskStep {
  id: string;
  stepOrder: number;
  name: string;
  type: string | null;
  status: string;
  outputData: Record<string, unknown> | null;
  notes: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

interface Task {
  id: string;
  tenantId: string;
  taskDefinitionId: string | null;
  processInstanceId: string | null;
  flowStepInstanceId: string | null;
  taskCode: string | null;
  name: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  assignedRole: string | null;
  dueAt: string | null;
  inputData: Record<string, unknown> | null;
  outputData: Record<string, unknown> | null;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  metadata: Record<string, unknown> | null;
  definitionName: string | null;
  createdAt: string;
  updatedAt: string;
  steps: TaskStep[];
}

// ── Badge styling ──

const statusStyles: Record<string, string> = {
  pending:
    "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300",
  in_progress:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  failed:
    "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  blocked:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  cancelled:
    "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300",
  skipped:
    "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300",
};

const priorityStyles: Record<string, string> = {
  critical:
    "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  high:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
  normal:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  low:
    "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300",
};

const typeStyles: Record<string, string> = {
  ai: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
  human:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  system:
    "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300",
};

function fmtLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmtDate(d: string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

function fmtDateTime(d: string | null): string {
  if (!d) return "-";
  const dt = new Date(d);
  return `${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}`;
}

function fmtDuration(ms: number | null): string {
  if (ms === null || ms === undefined) return "-";
  if (ms < 1000) return `${ms}ms`;
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remainSecs = secs % 60;
  if (mins < 60) return `${mins}m ${remainSecs}s`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hrs}h ${remainMins}m`;
}

// ── Complete Step Form ──

function CompleteStepForm({
  taskId,
  stepId,
  onCompleted,
}: {
  taskId: string;
  stepId: string;
  onCompleted: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [outputJson, setOutputJson] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    let parsedOutput: Record<string, unknown> | undefined;
    if (outputJson.trim()) {
      try {
        parsedOutput = JSON.parse(outputJson);
      } catch {
        setError("Output data must be valid JSON.");
        setSubmitting(false);
        return;
      }
    }

    try {
      const res = await fetch(
        `/api/v1/tasks/${taskId}/steps/${stepId}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCsrfToken(),
          },
          credentials: "include",
          body: JSON.stringify({
            notes: notes || undefined,
            outputData: parsedOutput,
          }),
        }
      );

      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message || `Error: ${res.status}`);
        return;
      }

      onCompleted();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-gray-400">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          placeholder="Add any notes about this step..."
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-gray-400">
          Output Data (JSON, optional)
        </label>
        <textarea
          value={outputJson}
          onChange={(e) => setOutputJson(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          placeholder='{"key": "value"}'
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
          Complete Step
        </button>
      </div>
    </form>
  );
}

// ── Main Detail Page ──

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const taskId = params.id;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [completingStepId, setCompletingStepId] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/tasks/${taskId}`, {
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 404) {
          setError("Task not found.");
          return;
        }
        setError("Failed to load task.");
        return;
      }
      const json = await res.json();
      setTask(json.data);
      setError(null);
    } catch {
      setError("Network error loading task.");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  // Initial fetch + auto-refresh every 10 seconds
  useEffect(() => {
    fetchTask();
    const interval = setInterval(fetchTask, 10000);
    return () => clearInterval(interval);
  }, [fetchTask]);

  function toggleStep(stepId: string) {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  }

  async function handleStartTask() {
    if (!task) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({ status: "in_progress" }),
      });
      if (res.ok) {
        await fetchTask();
      }
    } catch {
      // Silently fail — next auto-refresh will show correct state
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCompleteTask() {
    if (!task) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/tasks/${taskId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
      });
      if (res.ok) {
        await fetchTask();
      }
    } catch {
      // Silently fail
    } finally {
      setActionLoading(false);
    }
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // ── Error state ──
  if (error || !task) {
    return (
      <div className="space-y-4">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tasks
        </Link>
        <div className="rounded-lg border bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-slate-500 dark:text-gray-400">
            {error || "Task not found."}
          </p>
        </div>
      </div>
    );
  }

  const steps = task.steps || [];
  const currentStep = steps.find((s) => s.status === "in_progress");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/tasks"
            className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5 text-slate-500 dark:text-gray-400" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-100">
                {task.name}
              </h1>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  statusStyles[task.status] ?? statusStyles.pending
                }`}
              >
                {fmtLabel(task.status)}
              </span>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  priorityStyles[task.priority] ?? priorityStyles.normal
                }`}
              >
                {fmtLabel(task.priority)}
              </span>
            </div>
            {task.definitionName && (
              <p className="mt-0.5 text-sm text-slate-500 dark:text-gray-400">
                Template: {task.definitionName}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {task.status === "pending" && (
            <button
              onClick={handleStartTask}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Start Task
            </button>
          )}
          {task.status === "in_progress" && (
            <button
              onClick={handleCompleteTask}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Complete Task
            </button>
          )}
          <Link
            href={`/tasks/${taskId}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
            Status
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-gray-100">
            {fmtLabel(task.status)}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
            Priority
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-gray-100">
            {fmtLabel(task.priority)}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
            Assigned Role
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-gray-100">
            {task.assignedRole ?? "-"}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
            Due Date
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-gray-100">
            {fmtDate(task.dueAt)}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
            Duration
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-gray-100">
            {fmtDuration(task.durationMs)}
          </p>
        </div>
      </div>

      {/* Error message */}
      {task.errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-xs font-medium text-red-600 dark:text-red-400">
            Error
          </p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            {task.errorMessage}
          </p>
        </div>
      )}

      {/* Task Steps Timeline */}
      {steps.length > 0 && (
        <div className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-gray-100">
            Task Steps
          </h2>
          <div className="space-y-0">
            {steps.map((step, idx) => {
              const isExpanded = expandedSteps.has(step.id);
              const isCurrent = step.status === "in_progress";
              const isCompleted = step.status === "completed";
              const isLast = idx === steps.length - 1;
              const hasExpandableContent =
                step.outputData || step.notes;

              return (
                <div key={step.id} className="relative flex gap-4">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                        isCompleted
                          ? "border-green-500 bg-green-100 text-green-700 dark:border-green-400 dark:bg-green-900/50 dark:text-green-300"
                          : isCurrent
                            ? "border-blue-500 bg-blue-100 text-blue-700 dark:border-blue-400 dark:bg-blue-900/50 dark:text-blue-300"
                            : "border-slate-300 bg-slate-100 text-slate-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        step.stepOrder
                      )}
                    </div>
                    {!isLast && (
                      <div className="w-0.5 flex-1 bg-slate-200 dark:bg-gray-700" />
                    )}
                  </div>

                  {/* Step content */}
                  <div className={`flex-1 pb-6 ${isLast ? "pb-0" : ""}`}>
                    <div className="flex items-center gap-2">
                      {hasExpandableContent ? (
                        <button
                          onClick={() => toggleStep(step.id)}
                          className="flex items-center gap-1 text-sm font-medium text-slate-900 hover:text-brand-600 dark:text-gray-100 dark:hover:text-brand-400"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                          {step.name}
                        </button>
                      ) : (
                        <span className="text-sm font-medium text-slate-900 dark:text-gray-100">
                          {step.name}
                        </span>
                      )}
                      {step.type && (
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            typeStyles[step.type] ?? typeStyles.system
                          }`}
                        >
                          {step.type}
                        </span>
                      )}
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusStyles[step.status] ?? statusStyles.pending
                        }`}
                      >
                        {fmtLabel(step.status)}
                      </span>
                    </div>

                    {step.completedAt && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400 dark:text-gray-500">
                        <Clock className="h-3 w-3" />
                        Completed {fmtDateTime(step.completedAt)}
                      </p>
                    )}

                    {/* Expanded content */}
                    {isExpanded && hasExpandableContent && (
                      <div className="mt-2 space-y-2">
                        {step.notes && (
                          <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
                              Notes
                            </p>
                            <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700 dark:text-gray-300">
                              {step.notes}
                            </p>
                          </div>
                        )}
                        {step.outputData && (
                          <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
                              Output Data
                            </p>
                            <pre className="mt-0.5 overflow-x-auto rounded-md bg-slate-100 p-3 text-xs text-slate-700 dark:bg-gray-800 dark:text-gray-300">
                              {JSON.stringify(step.outputData, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Complete step button + form */}
                    {isCurrent && completingStepId !== step.id && (
                      <button
                        onClick={() => setCompletingStepId(step.id)}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-green-300 bg-white px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 dark:border-green-700 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Complete Step
                      </button>
                    )}
                    {completingStepId === step.id && (
                      <CompleteStepForm
                        taskId={taskId}
                        stepId={step.id}
                        onCompleted={() => {
                          setCompletingStepId(null);
                          fetchTask();
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Output Panel */}
      {task.outputData && (
        <div className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-gray-100">
            Task Output
          </h2>
          <pre className="overflow-x-auto rounded-md bg-slate-100 p-4 text-sm text-slate-700 dark:bg-gray-800 dark:text-gray-300">
            {JSON.stringify(task.outputData, null, 2)}
          </pre>
        </div>
      )}

      {/* Metadata section */}
      <div className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-gray-100">
          Metadata
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
              Task Code
            </p>
            <p className="mt-0.5 text-sm text-slate-900 dark:text-gray-100">
              {task.taskCode ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
              Definition ID
            </p>
            <p className="mt-0.5 text-sm font-mono text-slate-900 dark:text-gray-100">
              {task.taskDefinitionId ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
              Process Instance
            </p>
            <p className="mt-0.5 text-sm font-mono text-slate-900 dark:text-gray-100">
              {task.processInstanceId ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
              Started At
            </p>
            <p className="mt-0.5 text-sm text-slate-900 dark:text-gray-100">
              {fmtDateTime(task.startedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
              Completed At
            </p>
            <p className="mt-0.5 text-sm text-slate-900 dark:text-gray-100">
              {fmtDateTime(task.completedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
              Created
            </p>
            <p className="mt-0.5 text-sm text-slate-900 dark:text-gray-100">
              {fmtDateTime(task.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
              Updated
            </p>
            <p className="mt-0.5 text-sm text-slate-900 dark:text-gray-100">
              {fmtDateTime(task.updatedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
              Task ID
            </p>
            <p className="mt-0.5 text-sm font-mono text-slate-900 dark:text-gray-100">
              {task.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
