"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "checkbox" | "date";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface MdmFormProps {
  entityType: string;
  apiPath: string;
  fields: FieldConfig[];
  initialData?: Record<string, unknown>;
  isEdit?: boolean;
  returnPath: string;
}

export function MdmForm({
  entityType,
  apiPath,
  fields,
  initialData,
  isEdit,
  returnPath,
}: MdmFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, unknown>>(
    initialData ?? {}
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(name: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(apiPath, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message || "Failed to save");
        return;
      }

      router.push(returnPath);
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
          </svg>
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.name}
            className={
              field.type === "textarea" ? "sm:col-span-2" : undefined
            }
          >
            <label
              htmlFor={field.name}
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              {field.label}
              {field.required && (
                <span className="text-red-500"> *</span>
              )}
            </label>

            {field.type === "select" ? (
              <select
                id={field.name}
                value={String(formData[field.name] ?? "")}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              >
                <option value="">Select...</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                id={field.name}
                value={String(formData[field.name] ?? "")}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                placeholder={field.placeholder}
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            ) : field.type === "checkbox" ? (
              <input
                id={field.name}
                type="checkbox"
                checked={!!formData[field.name]}
                onChange={(e) =>
                  handleChange(field.name, e.target.checked)
                }
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
            ) : (
              <input
                id={field.name}
                type={field.type}
                value={String(formData[field.name] ?? "")}
                onChange={(e) =>
                  handleChange(
                    field.name,
                    field.type === "number"
                      ? e.target.value === ""
                        ? ""
                        : Number(e.target.value)
                      : e.target.value
                  )
                }
                required={field.required}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3 border-t border-slate-100 pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting
            ? "Saving..."
            : isEdit
              ? `Update ${entityType}`
              : `Create ${entityType}`}
        </button>
        <button
          type="button"
          onClick={() => router.push(returnPath)}
          className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
