"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCsrfToken } from "@/lib/client/csrf";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { SearchableSelect, type SelectOption } from "./searchable-select";
import { Loader2 } from "lucide-react";

// ── Field configuration ──────────────────────────────────────────

export interface FieldConfig {
  /** Field key — maps to formData[name] and API payload */
  name: string;
  /** Display label */
  label: string;
  /** Input type */
  type:
    | "text"
    | "number"
    | "select"
    | "searchable-select"
    | "textarea"
    | "checkbox"
    | "date"
    | "datetime-local"
    | "email"
    | "url"
    | "tel";
  /** Whether field is required */
  required?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Static options for "select" type */
  options?: SelectOption[];
  /** Lookup entity for "searchable-select" type (e.g., "ports", "vessels") */
  entity?: string;
  /** Number of textarea rows (default: 3) */
  rows?: number;
  /** Whether field takes full width (default: fields share 2-column grid) */
  fullWidth?: boolean;
  /** Help text below the field */
  helpText?: string;
  /** Disable this field */
  disabled?: boolean;
}

// ── Props ────────────────────────────────────────────────────────

interface GenericFormProps {
  /** Page title (e.g., "New Vessel Schedule") */
  title: string;
  /** API endpoint path (e.g., "/api/v1/capacity-voyage-management/vessel-schedules") */
  apiPath: string;
  /** HTTP method (default: POST for create, PATCH for edit) */
  method?: "POST" | "PATCH" | "PUT";
  /** Field definitions */
  fields: FieldConfig[];
  /** Initial data for edit mode */
  initialData?: Record<string, unknown>;
  /** Redirect path after successful submit */
  returnPath: string;
  /** Cancel path (defaults to returnPath) */
  cancelPath?: string;
  /** Submit button label (default: "Create" or "Update") */
  submitLabel?: string;
}

// ── Component ────────────────────────────────────────────────────

export function GenericForm({
  title,
  apiPath,
  method,
  fields,
  initialData,
  returnPath,
  cancelPath,
  submitLabel,
}: GenericFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const httpMethod = method || (isEdit ? "PATCH" : "POST");
  const buttonLabel = submitLabel || (isEdit ? "Update" : "Create");

  // Process initial data (normalize datetime values for inputs)
  const processedInitial = initialData
    ? Object.fromEntries(
        Object.entries(initialData).map(([k, v]) => {
          const field = fields.find((f) => f.name === k);
          if (field?.type === "datetime-local" && v && typeof v === "string") {
            return [k, v.slice(0, 16)];
          }
          if (field?.type === "date" && v && typeof v === "string") {
            return [k, v.slice(0, 10)];
          }
          return [k, v];
        })
      )
    : {};

  const [formData, setFormData] = useState<Record<string, unknown>>(processedInitial);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(name: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const res = await fetch(apiPath, {
        method: httpMethod,
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.error?.details) {
          // Zod validation errors — map to field-level
          const errors: Record<string, string> = {};
          for (const issue of json.error.details) {
            const path = issue.path?.join(".") || "unknown";
            errors[path] = issue.message;
          }
          setFieldErrors(errors);
          setError("Please fix the highlighted fields.");
        } else {
          setError(json.error?.message || `Error: ${res.status}`);
        }
        return;
      }

      router.push(returnPath);
      router.refresh();
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-gray-100">{title}</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          {fields.map((field) => (
            <div
              key={field.name}
              className={cn(field.fullWidth && "md:col-span-2")}
            >
              <label
                htmlFor={field.name}
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300"
              >
                {field.label}
                {field.required && <span className="text-red-500 ms-0.5">*</span>}
              </label>

              {/* Checkbox */}
              {field.type === "checkbox" && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={field.name}
                    checked={!!formData[field.name]}
                    onChange={(e) => handleChange(field.name, e.target.checked)}
                    disabled={field.disabled}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm text-slate-600 dark:text-gray-400">{field.placeholder || ""}</span>
                </label>
              )}

              {/* Textarea */}
              {field.type === "textarea" && (
                <textarea
                  id={field.name}
                  rows={field.rows || 3}
                  value={(formData[field.name] as string) ?? ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={field.disabled}
                  className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:border-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
              )}

              {/* Static select */}
              {field.type === "select" && (
                <select
                  id={field.name}
                  value={(formData[field.name] as string) ?? ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  disabled={field.disabled}
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:border-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="">{field.placeholder || "Select..."}</option>
                  {(field.options || []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {/* Searchable select (async lookup) */}
              {field.type === "searchable-select" && (
                <SearchableSelect
                  entity={field.entity}
                  options={field.options}
                  value={(formData[field.name] as string) ?? ""}
                  onChange={(val) => handleChange(field.name, val)}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={field.disabled}
                  name={field.name}
                />
              )}

              {/* Standard inputs (text, number, date, datetime-local, email, url, tel) */}
              {!["checkbox", "textarea", "select", "searchable-select"].includes(field.type) && (
                <Input
                  id={field.name}
                  type={field.type}
                  value={
                    formData[field.name] != null
                      ? String(formData[field.name])
                      : ""
                  }
                  onChange={(e) => {
                    const val =
                      field.type === "number"
                        ? e.target.value === "" ? "" : Number(e.target.value)
                        : e.target.value;
                    handleChange(field.name, val);
                  }}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={field.disabled}
                />
              )}

              {/* Field-level error */}
              {fieldErrors[field.name] && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors[field.name]}</p>
              )}

              {/* Help text */}
              {field.helpText && (
                <p className="mt-1 text-xs text-slate-400 dark:text-gray-500">{field.helpText}</p>
              )}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6 dark:border-gray-700">
          <button
            type="button"
            onClick={() => router.push(cancelPath || returnPath)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {buttonLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
