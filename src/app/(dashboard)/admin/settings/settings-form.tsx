"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  currency: string;
  country: string;
  logoUrl: string | null;
  plan: string;
}

interface OrgSettingsFormProps {
  tenant: Tenant;
  canEdit: boolean;
}

const TIMEZONES = [
  "Asia/Qatar",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Kolkata",
  "UTC",
];

const CURRENCIES = ["QAR", "AED", "SAR", "INR", "USD"];
const COUNTRIES = [
  { code: "QA", name: "Qatar" },
  { code: "AE", name: "UAE" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "IN", name: "India" },
];

export function OrgSettingsForm({ tenant, canEdit }: OrgSettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(tenant.name);
  const [timezone, setTimezone] = useState(tenant.timezone);
  const [currency, setCurrency] = useState(tenant.currency);
  const [country, setCountry] = useState(tenant.country);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/v1/tenants/${tenant.id}`, {
        credentials: "include",
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, timezone, currency, country }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || "Failed to save");
        return;
      }
      setSuccess(true);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="max-w-xl space-y-6">
      <div className="rounded-lg border bg-white p-6 space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">Settings saved</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Organization Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!canEdit}
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Country</label>
          <select
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            disabled={!canEdit}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Timezone</label>
          <select
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            disabled={!canEdit}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Currency</label>
          <select
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            disabled={!canEdit}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Plan</label>
          <Input value={tenant.plan} disabled className="mt-1" />
          <p className="mt-1 text-xs text-gray-400">Contact support to change your plan</p>
        </div>

        {canEdit && (
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        )}
      </div>
    </form>
  );
}
