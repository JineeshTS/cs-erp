"use client";

import { useState } from "react";
import { Play, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface RunProcessButtonProps {
  processId: string;
  processName: string;
  aiProcessingSteps: string[];
  humanTouchpoints: string[];
}

const ENTITY_TYPES = ["booking", "vessel", "container", "invoice", "customs_clearance", "other"] as const;

export function RunProcessButton({
  processId,
  processName,
  aiProcessingSteps,
  humanTouchpoints,
}: RunProcessButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [entityType, setEntityType] = useState("");
  const [entityId, setEntityId] = useState("");
  const [contextJson, setContextJson] = useState("");

  function reset() {
    setError(null);
    setSuccess(null);
    setEntityType("");
    setEntityId("");
    setContextJson("");
  }

  function handleOpen() {
    reset();
    setOpen(true);
  }

  function handleClose() {
    if (!loading) setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate entityId as UUID if provided
    if (entityId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entityId)) {
      setError("Entity ID must be a valid UUID format");
      return;
    }

    // Parse context JSON if provided
    let parsedContext: Record<string, unknown> | undefined;
    if (contextJson.trim()) {
      try {
        parsedContext = JSON.parse(contextJson.trim());
      } catch {
        setError("Invalid JSON in context field");
        return;
      }
    }

    // Build steps from aiProcessingSteps + humanTouchpoints
    const steps = [
      ...aiProcessingSteps.map((s, i) => ({
        stepNumber: i + 1,
        stepName: s,
        executorType: "ai" as const,
      })),
      ...humanTouchpoints.map((s, i) => ({
        stepNumber: aiProcessingSteps.length + i + 1,
        stepName: s,
        executorType: "human" as const,
      })),
    ];

    if (steps.length === 0) {
      setError("This process has no defined steps");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/process-engine/instances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": document.cookie.match(/csrf_token=([^;]+)/)?.[1] ?? "1",
        },
        body: JSON.stringify({
          processId,
          processName,
          triggerType: "manual",
          ...(entityType ? { entityType } : {}),
          ...(entityId ? { entityId } : {}),
          ...(parsedContext ? { contextJson: parsedContext } : {}),
          steps,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 403) {
          setError("You do not have permission to run processes");
        } else if (res.status === 429) {
          setError("Too many requests. Please try again later.");
        } else {
          setError(body?.error?.message ?? `Failed to start process (${res.status})`);
        }
        return;
      }

      const body = await res.json();
      setSuccess(body.data?.id ?? "started");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); handleOpen(); }}
        className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
        title={`Run ${processName}`}
      >
        <Play className="h-3 w-3" />
        Run
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
          <div
            className="mx-4 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Run Process</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{processId} — {processName}</p>
              </div>
              <button onClick={handleClose} className="rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="h-4 w-4" />
              </button>
            </div>

            {success ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2 rounded-md bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 p-3">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Process started</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">{success}</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-full rounded-md bg-slate-900 dark:bg-slate-100 dark:text-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Entity Type (optional)</label>
                  <select
                    value={entityType}
                    onChange={(e) => setEntityType(e.target.value)}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {ENTITY_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Entity ID (optional)</label>
                  <input
                    type="text"
                    value={entityId}
                    onChange={(e) => setEntityId(e.target.value)}
                    placeholder="UUID of the entity"
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Context JSON (optional)</label>
                  <textarea
                    value={contextJson}
                    onChange={(e) => setContextJson(e.target.value)}
                    placeholder='{"key": "value"}'
                    rows={3}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="rounded-md bg-slate-50 dark:bg-slate-800 p-2.5">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {aiProcessingSteps.length + humanTouchpoints.length} steps: {aiProcessingSteps.length} AI + {humanTouchpoints.length} human
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-md bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 p-3">
                    <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-rose-800 dark:text-rose-200">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Start Process
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
