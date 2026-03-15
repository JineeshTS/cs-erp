"use client";

import { useState } from "react";
import { Zap, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface FlowStep {
  step: string;
  module: string;
  type: "ai" | "human" | "system";
}

interface RunE2EFlowButtonProps {
  flowId: string;
  flowName: string;
  steps: FlowStep[];
}

export function RunE2EFlowButton({ flowId, flowName, steps }: RunE2EFlowButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleClose() {
    if (!loading) setOpen(false);
  }

  async function handleExecute() {
    setError(null);
    setLoading(true);

    const processSteps = steps.map((s, i) => ({
      stepNumber: i + 1,
      stepName: `[${s.module}] ${s.step}`,
      executorType: s.type,
    }));

    try {
      const res = await fetch("/api/v1/process-engine/instances", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": document.cookie.match(/csrf_token=([^;]+)/)?.[1] ?? "1" },
        body: JSON.stringify({
          processId: flowId,
          processName: flowName,
          triggerType: "manual",
          steps: processSteps,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error?.message ?? `Failed to start flow (${res.status})`);
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
        onClick={() => { setError(null); setSuccess(null); setOpen(true); }}
        className="inline-flex items-center gap-1.5 rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700 transition-colors dark:bg-purple-500 dark:hover:bg-purple-600"
      >
        <Zap className="h-3.5 w-3.5" />
        Execute Flow
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
          <div
            className="mx-4 w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Execute E2E Flow</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{flowId} — {flowName}</p>
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
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Flow started</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">{success}</p>
                  </div>
                </div>
                <button onClick={handleClose} className="w-full rounded-md bg-slate-900 dark:bg-slate-100 dark:text-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-200">
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md bg-slate-50 dark:bg-slate-800 p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{steps.length} steps across {new Set(steps.map((s) => s.module)).size} modules</p>
                  <div className="flex gap-2 text-xs">
                    <span className="text-blue-600">{steps.filter((s) => s.type === "ai").length} AI</span>
                    <span className="text-emerald-600">{steps.filter((s) => s.type === "human").length} Human</span>
                    <span className="text-slate-500">{steps.filter((s) => s.type === "system").length} System</span>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-md bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 p-3">
                    <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-rose-800 dark:text-rose-200">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleExecute}
                  disabled={loading}
                  className="w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-purple-500 dark:hover:bg-purple-600 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Start Execution
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
