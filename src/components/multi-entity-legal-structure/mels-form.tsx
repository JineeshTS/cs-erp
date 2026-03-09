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

interface MelsFormProps {
  entityType: string;
  apiPath: string;
  fields: FieldConfig[];
  initialData?: Record<string, unknown>;
  isEdit?: boolean;
  returnPath: string;
}

export type { FieldConfig };

export function MelsForm({
  entityType,
  apiPath,
  fields,
  initialData,
  isEdit,
  returnPath,
}: MelsFormProps) {
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
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {fields.map((field) => (
        <div key={field.name}>
          {field.type === "checkbox" ? (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!formData[field.name]}
                onChange={(e) => handleChange(field.name, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                {field.label}
              </span>
            </label>
          ) : (
            <>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  value={(formData[field.name] as string) || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              ) : field.type === "select" ? (
                <select
                  value={(formData[field.name] as string) || ""}
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
              ) : (
                <input
                  type={field.type}
                  value={
                    field.type === "number"
                      ? ((formData[field.name] as number) ?? "")
                      : ((formData[field.name] as string) || "")
                  }
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
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              )}
            </>
          )}
        </div>
      ))}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Saving..." : isEdit ? `Update ${entityType}` : `Create ${entityType}`}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
