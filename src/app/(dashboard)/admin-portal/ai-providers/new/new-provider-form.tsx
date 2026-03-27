"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PROVIDER_OPTIONS = [
  { value: "anthropic", label: "Anthropic" },
  { value: "openai", label: "OpenAI" },
  { value: "google", label: "Google" },
  { value: "azure_openai", label: "Azure OpenAI" },
  { value: "aws_bedrock", label: "AWS Bedrock" },
  { value: "ollama", label: "Ollama" },
  { value: "custom", label: "Custom" },
];

export function NewProviderForm() {
  const router = useRouter();
  const [providerName, setProviderName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/v1/admin/ai-providers", {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerName,
          displayName,
          apiKey,
          apiEndpoint: apiEndpoint || undefined,
          isDefault,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message || "Failed to create provider");
        return;
      }

      router.push("/admin-portal/ai-providers");
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
        <div>
          <label
            htmlFor="providerName"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Provider Name <span className="text-red-500">*</span>
          </label>
          <select
            id="providerName"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select provider...</option>
            {PROVIDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="displayName"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Display Name <span className="text-red-500">*</span>
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            placeholder="e.g. Anthropic Claude"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="apiKey"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            API Key
          </label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            autoComplete="off"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Key will be encrypted before storage.
          </p>
        </div>

        <div>
          <label
            htmlFor="apiEndpoint"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            API Endpoint
          </label>
          <input
            id="apiEndpoint"
            type="text"
            value={apiEndpoint}
            onChange={(e) => setApiEndpoint(e.target.value)}
            placeholder="https://api.example.com/v1 (optional)"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="sm:col-span-2">
          <div className="flex items-center gap-2 pt-1">
            <input
              id="isDefault"
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label
              htmlFor="isDefault"
              className="text-sm text-gray-600"
            >
              Set as default provider
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Create Provider"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin-portal/ai-providers")}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
