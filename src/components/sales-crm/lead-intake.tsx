"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Sparkles, Loader2, ArrowRight, RotateCcw } from "lucide-react";

const SAMPLE_INQUIRY = `Dear Team,

Gulf Shipping & Logistics LLC, based in Doha, Qatar, is looking for a reliable weekly FCL service from Jebel Ali to Mundra for 500 TEU/month. We ship auto parts and electronics in 40ft dry containers.

Our current provider has frequent schedule delays and we are evaluating alternatives for next month.

Please provide your best rates and transit time.

Best regards,
Ahmed Al-Rashid
Head of Procurement
Gulf Shipping & Logistics LLC
ahmed.alrashid@gulfshipping.qa
+974 5551 2345`;

interface ExtractedField {
  field: string;
  value: string | number;
  label: string;
}

export function LeadIntake() {
  const router = useRouter();
  const [rawText, setRawText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExtract() {
    if (!rawText.trim()) return;
    setExtracting(true);
    setError(null);
    setExtracted(null);

    try {
      const res = await fetch("/api/v1/sales-crm/leads/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? `Extraction failed (${res.status})`);
      }

      const { data } = await res.json();
      setExtracted(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setExtracting(false);
    }
  }

  function handleGoToForm() {
    if (!extracted) return;
    sessionStorage.setItem("ai-prefill", JSON.stringify(extracted));
    router.push("/sales-crm/leads/new");
    // Force refresh if already on the page
    router.refresh();
  }

  function handleLoadSample() {
    setRawText(SAMPLE_INQUIRY);
    setExtracted(null);
    setError(null);
  }

  function handleReset() {
    setRawText("");
    setExtracted(null);
    setError(null);
  }

  const FIELD_LABELS: Record<string, string> = {
    companyName: "Company",
    contactName: "Contact",
    contactEmail: "Email",
    contactPhone: "Phone",
    jobTitle: "Job Title",
    country: "Country",
    city: "City",
    industry: "Industry",
    estimatedTeu: "Est. TEU/month",
    tradeLane: "Trade Lane",
    source: "Source",
    notes: "Notes",
  };

  const fields: ExtractedField[] = extracted
    ? Object.entries(extracted)
        .filter(([, v]) => v !== null && v !== undefined && v !== "")
        .map(([field, value]) => ({
          field,
          value: value as string | number,
          label: FIELD_LABELS[field] ?? field,
        }))
    : [];

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          Smart Intake — Paste an Inquiry
        </h3>
      </div>

      <p className="text-xs text-blue-700 dark:text-blue-300">
        Paste an email, web enquiry, or any text. AI will extract company details, contact info, trade lane, and volume to pre-fill the lead form.
      </p>

      {!extracted ? (
        <>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste shipping inquiry email or text here..."
            rows={8}
            className="w-full rounded-md border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={handleExtract}
              disabled={extracting || !rawText.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {extracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Extract Lead Data
                </>
              )}
            </button>
            <button
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 rounded-md border border-blue-300 dark:border-blue-700 px-3 py-2 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              Load Sample Inquiry
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <div className="rounded-md border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 p-4">
            <h4 className="text-xs font-semibold text-green-800 dark:text-green-200 uppercase mb-3">
              Extracted Fields ({fields.length})
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {fields.map(({ field, value, label }) => (
                <div key={field} className="flex gap-2 text-sm">
                  <span className="font-medium text-green-700 dark:text-green-300 min-w-[100px]">
                    {label}:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 truncate">
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGoToForm}
              className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <ArrowRight className="h-4 w-4" />
              Go to Lead Form (Pre-filled)
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <RotateCcw className="h-4 w-4" />
              Start Over
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
