"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  CheckCircle,
  Database,
  ExternalLink,
  Loader2,
  Monitor,
  User,
  X,
  Zap,
} from "lucide-react";
import { useState, useCallback, Suspense } from "react";
import { getCsrfToken } from "@/lib/client/csrf";

// ── Helpers ──

const STEP_STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", label: "Pending" },
  in_progress: { bg: "bg-blue-100 dark:bg-blue-900/50", text: "text-blue-700 dark:text-blue-300", label: "In Progress" },
  completed: { bg: "bg-emerald-100 dark:bg-emerald-900/50", text: "text-emerald-700 dark:text-emerald-300", label: "Completed" },
  failed: { bg: "bg-rose-100 dark:bg-rose-900/50", text: "text-rose-700 dark:text-rose-300", label: "Failed" },
  blocked: { bg: "bg-amber-100 dark:bg-amber-900/50", text: "text-amber-700 dark:text-amber-300", label: "Blocked" },
  skipped: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400", label: "Skipped" },
};

const EXECUTOR_ICONS: Record<string, typeof Bot> = {
  ai_agent: Bot,
  ai: Bot,
  human: User,
  system: Monitor,
  external: ExternalLink,
};

// ── Inner component that uses useSearchParams ──

function FlowContextBannerInner() {
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);
  const [completing, setCompleting] = useState(false);

  const flowId = searchParams.get("e2eFlowId");
  const txId = searchParams.get("e2eTxId");
  const stepNumber = searchParams.get("e2eStep");
  const stepName = searchParams.get("e2eStepName");
  const stepStatus = searchParams.get("e2eStepStatus") ?? "pending";
  const executorType = searchParams.get("e2eExecutor") ?? "ai";
  const flowName = searchParams.get("e2eFlowName");
  const totalSteps = searchParams.get("e2eTotalSteps");

  // Don't render if no flow context or dismissed
  if (!flowId || !txId || dismissed) return null;

  const statusStyle = STEP_STATUS_STYLES[stepStatus] ?? STEP_STATUS_STYLES.pending;
  const ExecutorIcon = EXECUTOR_ICONS[executorType] ?? Monitor;

  const backUrl = `/e2e-flows/${txId}`;
  const definitionUrl = `/e2e-flows/definition/${flowId}`;

  // D-006: Read entity binding params for step-complete callback
  const entityTable = searchParams.get("e2eEntityTable");
  const entityAction = searchParams.get("e2eEntityAction") ?? "create";

  const TABLE_LABELS: Record<string, string> = {
    scm_leads: "Lead",
    scm_opportunities: "Opportunity",
    scm_rate_quotations: "Rate Quotation",
    scm_contracts: "Contract",
    scm_customers: "Customer",
  };

  const handleMarkComplete = async (entityId?: string) => {
    setCompleting(true);
    try {
      // D-006: If we have entity binding context, use step-complete endpoint
      if (txId && stepNumber && entityTable && entityId) {
        const res = await fetch(`/api/v1/process-engine/e2e-flows/${txId}/step-complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCsrfToken(),
          },
          body: JSON.stringify({
            stepNumber: parseInt(stepNumber, 10),
            entityId,
            entityTable,
            entityAction,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          alert(`Failed: ${err?.error?.message ?? res.statusText}`);
        } else {
          window.location.href = backUrl;
        }
        return;
      }

      // Legacy: advance step without entity binding
      const res = await fetch(`/api/v1/process-engine/e2e-flows/${txId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        body: JSON.stringify({
          output: { completedManually: true, completedAt: new Date().toISOString(), completedFromModule: true },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        alert(`Failed: ${err?.error?.message ?? res.statusText}`);
      } else {
        window.location.href = backUrl;
      }
    } catch {
      alert("Network error");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="mb-4 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950/40 dark:to-indigo-950/40">
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Left: Flow context info */}
        <div className="flex items-center gap-3 min-w-0">
          <Zap className="h-4 w-4 shrink-0 text-blue-500" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {flowName ?? flowId}
              </span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                {flowId}
              </span>
              {stepNumber && totalSteps && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Step {stepNumber}/{totalSteps}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <ExecutorIcon className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
                {stepName ?? `Step ${stepNumber}`}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                {statusStyle.label}
              </span>
              {entityTable && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                  <Database className="h-2.5 w-2.5" />
                  {entityAction} {TABLE_LABELS[entityTable] ?? entityTable}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-3">
          {/* Mark Complete (only for pending/in_progress steps) */}
          {(stepStatus === "pending" || stepStatus === "in_progress") && (
            <button
              onClick={() => handleMarkComplete()}
              disabled={completing}
              className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {completing ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
              Mark Step Complete
            </button>
          )}

          {/* Back to Transaction */}
          <Link
            href={backUrl}
            className="flex items-center gap-1.5 rounded-md border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:bg-gray-900 dark:text-blue-300 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Flow
          </Link>

          {/* View Definition */}
          <Link
            href={definitionUrl}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="View flow definition"
          >
            <ExternalLink className="h-3 w-3" />
          </Link>

          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            title="Dismiss banner"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Exported wrapper with Suspense (required for useSearchParams) ──

export function FlowContextBanner() {
  return (
    <Suspense fallback={null}>
      <FlowContextBannerInner />
    </Suspense>
  );
}
