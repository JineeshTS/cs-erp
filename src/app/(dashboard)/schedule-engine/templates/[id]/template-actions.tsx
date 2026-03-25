"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCsrfToken } from "@/lib/client/csrf";
import { Calendar, Loader2, Sparkles } from "lucide-react";

interface TemplateActionsProps {
  templateId: string;
}

export function TemplateActions({ templateId }: TemplateActionsProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ voyagesGenerated: number; voyages: Array<{ voyageNumber: string; startDate: string; endDate: string }> } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!startDate || !endDate) {
      setError("Both start and end dates are required");
      return;
    }
    setError(null);
    setResult(null);
    setGenerating(true);

    try {
      const res = await fetch(`/api/v1/schedule-engine/templates/${templateId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfToken() },
        credentials: "include",
        body: JSON.stringify({ startDate, endDate }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message || "Generation failed");
        return;
      }

      setResult(json.data);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="rounded-lg border border-brand-200 bg-brand-50 p-6 dark:border-brand-800 dark:bg-brand-900/10">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-gray-100">
        <Sparkles className="h-5 w-5 text-brand-600" />
        Generate Schedule
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
        Create concrete voyages from this template. Each frequency cycle generates a new voyage with calculated ETAs and cutoffs.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-300">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating || !startDate || !endDate}
          className="flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
          {generating ? "Generating..." : "Generate Voyages"}
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <p className="font-semibold text-green-800 dark:text-green-400">
            Generated {result.voyagesGenerated} voyages
          </p>
          <ul className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-300">
            {result.voyages.slice(0, 5).map((v) => (
              <li key={v.voyageNumber}>
                {v.voyageNumber}: {v.startDate} → {v.endDate}
              </li>
            ))}
            {result.voyages.length > 5 && (
              <li className="text-green-600">...and {result.voyages.length - 5} more</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
