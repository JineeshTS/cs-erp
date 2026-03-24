"use client";

/**
 * StepInputForm (D-006 Phase 3)
 *
 * Dynamic form rendered from step.inputFields metadata.
 * Pre-fills from prior step entity bindings via /step-context API.
 * On submit → calls /step-complete endpoint to bind entity + advance flow.
 *
 * Supports: text, number, select, date, textarea.
 */

import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { getCsrfToken } from "@/lib/client/csrf";

// ── Types ──

interface StepDataField {
  field: string;
  source: string;
  required: boolean;
  providedBy?: string;
}

interface StepInputFormProps {
  flowInstanceId: string;
  stepNumber: number;
  stepName: string;
  inputFields: StepDataField[];
  entityTable?: string;
  entityAction?: string;
  onComplete?: (binding: { entityId: string; entityTable: string }) => void;
}

interface StepContext {
  resolvedInputs: Record<string, unknown>;
  unresolvedFields: StepDataField[];
  entitySnapshots: Record<string, Record<string, unknown>>;
}

// ── Helpers ──

/** Human-friendly labels for DB column names */
const COLUMN_LABELS: Record<string, string> = {
  companyName: "Company Name",
  contactName: "Contact Person",
  contactEmail: "Email",
  contactPhone: "Phone",
  source: "Source",
  tradeLane: "Trade Lane",
  estimatedTeu: "Estimated TEU",
  estimatedRevenue: "Est. Revenue",
  qualificationScore: "Score",
  status: "Status",
  country: "Country",
  city: "City",
  industry: "Industry",
  jobTitle: "Job Title",
  notes: "Notes",
};

/** Fields to skip when rendering entity summary */
const HIDDEN_FIELDS = new Set([
  "id", "tenantId", "deletedAt", "createdAt", "updatedAt", "metadata",
  "campaignId", "assignedTo", "convertedToCustomerId", "convertedAt",
]);

function formatFieldLabel(key: string): string {
  return COLUMN_LABELS[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
}

function inferFieldType(fieldName: string): "text" | "number" | "date" | "textarea" | "select" {
  const lower = fieldName.toLowerCase();
  if (lower.includes("date") || lower.includes("deadline") || lower.includes("valid from") || lower.includes("valid to")) return "date";
  if (lower.includes("volume") || lower.includes("teu") || lower.includes("revenue") || lower.includes("amount") || lower.includes("score") || lower.includes("limit") || lower.includes("days")) return "number";
  if (lower.includes("notes") || lower.includes("description") || lower.includes("strategy") || lower.includes("analysis") || lower.includes("brief")) return "textarea";
  if (lower.includes("source") || lower.includes("channel") || lower.includes("type") || lower.includes("rating") || lower.includes("incoterm") || lower === "country" || lower === "industry" || lower.includes("cargo type")) return "select";
  return "text";
}

/** Map field name patterns to form-options API field keys */
const FIELD_TO_OPTIONS_KEY: Record<string, string> = {
  "source": "source",
  "channel": "source",
  "cargo type": "cargo_type",
  "type": "cargo_type",
  "rating": "rating",
  "incoterm": "incoterm",
  "country": "country",
  "industry": "industry",
};

interface SelectOption { value: string; label: string }

function matchOptionsKey(fieldName: string): string | null {
  const lower = fieldName.toLowerCase();
  for (const [pattern, key] of Object.entries(FIELD_TO_OPTIONS_KEY)) {
    if (lower.includes(pattern)) return key;
  }
  return null;
}

// ── Component ──

export function StepInputForm({
  flowInstanceId,
  stepNumber,
  stepName,
  inputFields,
  entityTable,
  entityAction,
  onComplete,
}: StepInputFormProps) {
  const [context, setContext] = useState<StepContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [selectOptions, setSelectOptions] = useState<Record<string, SelectOption[]>>({});

  // Fetch dropdown options for select fields
  useEffect(() => {
    const optionKeys = new Set<string>();
    for (const field of inputFields) {
      const key = matchOptionsKey(field.field);
      if (key) optionKeys.add(key);
    }
    if (optionKeys.size === 0) return;

    fetch(`/api/v1/process-engine/form-options?fields=${Array.from(optionKeys).join(",")}`)
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (json?.data) setSelectOptions(json.data);
      })
      .catch(() => { /* best-effort */ });
  }, [inputFields]);

  // Fetch step context on mount
  const fetchContext = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/process-engine/e2e-flows/${flowInstanceId}/step-context?step=${stepNumber}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const json = await res.json();
      const ctx = json.data as StepContext;
      setContext(ctx);

      // Pre-fill form from resolved inputs
      const prefilled: Record<string, string> = {};
      for (const field of inputFields) {
        const resolved = ctx.resolvedInputs[field.field];
        if (resolved !== undefined && resolved !== null) {
          // Don't stringify objects into form fields — they'll be rendered as summaries
          if (typeof resolved !== "object") {
            prefilled[field.field] = String(resolved);
          }
        }
      }
      setFormValues((prev) => ({ ...prefilled, ...prev }));
    } catch {
      // Context fetch is best-effort
    } finally {
      setLoading(false);
    }
  }, [flowInstanceId, stepNumber, inputFields]);

  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  const handleChange = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // Validate required fields
    for (const field of inputFields) {
      if (field.required && !formValues[field.field]?.trim()) {
        setError(`"${field.field}" is required`);
        setSubmitting(false);
        return;
      }
    }

    try {
      // Build entity data from form values
      const entityData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(formValues)) {
        if (value.trim()) {
          // Try to parse numbers
          const fieldType = inferFieldType(key);
          if (fieldType === "number") {
            entityData[key] = Number(value) || value;
          } else {
            entityData[key] = value;
          }
        }
      }

      const res = await fetch(`/api/v1/process-engine/e2e-flows/${flowInstanceId}/step-complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        body: JSON.stringify({
          stepNumber,
          entityId: crypto.randomUUID(), // Generated client-side for new entities
          entityTable: entityTable ?? "pe_e2e_step_instances",
          entityAction: entityAction ?? "create",
          entityData,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error?.message ?? `Failed (${res.status})`);
      }

      const result = await res.json();
      setSuccess(true);
      onComplete?.({
        entityId: result.data?.binding?.entityId ?? "",
        entityTable: result.data?.binding?.entityTable ?? entityTable ?? "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Step completed — entity created and flow advanced
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
      <div className="border-b border-blue-200 px-4 py-2.5 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            Step {stepNumber}: {stepName}
          </h4>
          {entityTable && (
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-mono text-blue-600 dark:bg-blue-900 dark:text-blue-400">
              {entityAction ?? "create"} → {entityTable}
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 py-4 justify-center text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading step context...</span>
          </div>
        ) : (
          <>
            {inputFields.map((field) => {
              const resolved = context?.resolvedInputs[field.field];
              const isObjectValue = resolved !== null && resolved !== undefined && typeof resolved === "object";
              const fieldType = inferFieldType(field.field);
              const isResolved = resolved !== undefined;
              const value = formValues[field.field] ?? "";

              // Render object values as a read-only summary panel
              if (isObjectValue) {
                const entries = Object.entries(resolved as Record<string, unknown>)
                  .filter(([k, v]) => !HIDDEN_FIELDS.has(k) && v !== null && v !== undefined && v !== "");
                return (
                  <div key={field.field} className="space-y-1">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                      {field.field}
                      <span className="rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-medium text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400">
                        from prior step
                      </span>
                    </label>
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        {entries.map(([k, v]) => (
                          <div key={k} className="contents">
                            <dt className="font-medium text-gray-500 dark:text-gray-400">{formatFieldLabel(k)}</dt>
                            <dd className="text-gray-900 dark:text-gray-100 truncate" title={String(v)}>{String(v)}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                );
              }

              return (
                <div key={field.field} className="space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                    {field.field}
                    {field.required && <span className="text-rose-500">*</span>}
                    {isResolved && (
                      <span className="rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-medium text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400">
                        auto-filled
                      </span>
                    )}
                    {field.providedBy && !isResolved && (
                      <span className="text-[9px] text-gray-400">from {field.providedBy}</span>
                    )}
                  </label>

                  {fieldType === "textarea" ? (
                    <textarea
                      value={value}
                      onChange={(e) => handleChange(field.field, e.target.value)}
                      rows={3}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder={field.source}
                    />
                  ) : fieldType === "select" ? (() => {
                    const optKey = matchOptionsKey(field.field);
                    const opts = optKey ? selectOptions[optKey] : [];
                    return (
                      <select
                        value={value}
                        onChange={(e) => handleChange(field.field, e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">Select...</option>
                        {opts && opts.length > 0
                          ? opts.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))
                          : null
                        }
                      </select>
                    );
                  })() : (
                    <input
                      type={fieldType === "date" ? "date" : fieldType === "number" ? "number" : "text"}
                      value={value}
                      onChange={(e) => handleChange(field.field, e.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder={field.source}
                    />
                  )}
                </div>
              );
            })}
          </>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded bg-rose-50 px-3 py-2 dark:bg-rose-950/30">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={submitting || loading}
            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {submitting ? "Completing..." : "Complete Step"}
          </button>
          {context && (
            <button
              type="button"
              onClick={fetchContext}
              className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400"
              title="Refresh pre-filled data from prior steps"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh Context
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
