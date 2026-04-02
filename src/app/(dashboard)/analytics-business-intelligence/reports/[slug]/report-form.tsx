"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";

interface ParamDef {
  key: string;
  label: string;
  type: "date" | "text";
}

interface Props {
  slug: string;
  params: ParamDef[];
  values: Record<string, string>;
}

export function ReportParameterForm({ slug, params, values }: Props) {
  const router = useRouter();
  const [formValues, setFormValues] = useState<Record<string, string>>(values);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(formValues)) {
      if (v) sp.set(k, v);
    }
    router.push(
      `/analytics-business-intelligence/reports/${slug}?${sp.toString()}`
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/analytics-business-intelligence/reports"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          All Reports
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {params.map((p) => (
          <div key={p.key}>
            <label
              htmlFor={p.key}
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {p.label}
            </label>
            <input
              id={p.key}
              type={p.type}
              value={formValues[p.key] ?? ""}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, [p.key]: e.target.value }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Play className="h-4 w-4" />
          Run Report
        </button>
        <button
          type="button"
          onClick={() => {
            const cleared: Record<string, string> = {};
            for (const p of params) cleared[p.key] = "";
            setFormValues(cleared);
            router.push(`/analytics-business-intelligence/reports/${slug}`);
          }}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
