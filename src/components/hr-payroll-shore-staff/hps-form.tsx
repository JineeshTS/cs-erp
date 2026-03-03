"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "checkbox" | "date" | "datetime-local";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface HpsFormProps {
  entityType: string;
  apiPath: string;
  fields: FieldConfig[];
  initialData?: Record<string, unknown>;
  isEdit?: boolean;
  returnPath: string;
  method?: string;
}

export type { FieldConfig };

export function HpsForm({
  entityType,
  apiPath,
  fields,
  initialData,
  isEdit,
  returnPath,
  method,
}: HpsFormProps) {
  const router = useRouter();

  const processedInitial = initialData
    ? Object.fromEntries(
        Object.entries(initialData).map(([k, v]) => {
          const field = fields.find((f) => f.name === k);
          if (field?.type === "datetime-local" && v && typeof v === "string") {
            return [k, v.slice(0, 16)];
          }
          return [k, v];
        })
      )
    : {};

  const [formData, setFormData] = useState<Record<string, unknown>>(processedInitial);
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
      const payload = { ...formData };
      for (const field of fields) {
        if (field.type === "datetime-local" && payload[field.name]) {
          const val = String(payload[field.name]);
          if (val && !val.endsWith("Z")) {
            payload[field.name] = new Date(val).toISOString();
          }
        }
      }

      const res = await fetch(apiPath, {
        method: method ?? (isEdit ? "PATCH" : "POST"),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message || "Failed to save");
        return;
      }

      router.push(returnPath);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.name}
            className={field.type === "textarea" ? "sm:col-span-2" : undefined}
          >
            <label
              htmlFor={field.name}
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </label>

            {field.type === "select" ? (
              <select
                id={field.name}
                value={String(formData[field.name] ?? "")}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            ) : field.type === "checkbox" ? (
              <input
                id={field.name}
                type="checkbox"
                checked={!!formData[field.name]}
                onChange={(e) => handleChange(field.name, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
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
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
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
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
