"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

interface RoleFormProps {
  allPermissions: Permission[];
  initialData?: {
    name: string;
    description: string;
    country: string;
    region: string;
    permissionIds: string[];
  };
  isEdit?: boolean;
  apiPath: string;
  returnPath: string;
}

const COUNTRIES = [
  { value: "", label: "Global (No Country)" },
  { value: "QAT", label: "Qatar" },
  { value: "ARE", label: "UAE" },
  { value: "SAU", label: "Saudi Arabia" },
  { value: "IND", label: "India" },
  { value: "SGP", label: "Singapore" },
  { value: "GBR", label: "United Kingdom" },
];

const COUNTRY_TO_REGION: Record<string, string> = {
  QAT: "Middle East",
  ARE: "Middle East",
  SAU: "Middle East",
  IND: "South Asia",
  SGP: "Southeast Asia",
  GBR: "Europe",
};

export function RoleForm({ allPermissions, initialData, isEdit, apiPath, returnPath }: RoleFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [country, setCountry] = useState(initialData?.country ?? "");
  const [region, setRegion] = useState(initialData?.region ?? "");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialData?.permissionIds ?? []));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const grouped = useMemo(() => {
    const map: Record<string, Permission[]> = {};
    for (const p of allPermissions) {
      if (!map[p.resource]) map[p.resource] = [];
      map[p.resource].push(p);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [allPermissions]);

  function togglePerm(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleResource(perms: Permission[]) {
    const allSelected = perms.every((p) => selectedIds.has(p.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const p of perms) {
        if (allSelected) next.delete(p.id);
        else next.add(p.id);
      }
      return next;
    });
  }

  function selectAllByAction(action: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const matching = allPermissions.filter((p) => p.action === action);
      const allSelected = matching.every((p) => next.has(p.id));
      for (const p of matching) {
        if (allSelected) next.delete(p.id);
        else next.add(p.id);
      }
      return next;
    });
  }

  function selectAll() {
    if (selectedIds.size === allPermissions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allPermissions.map((p) => p.id)));
    }
  }

  function handleCountryChange(val: string) {
    setCountry(val);
    setRegion(COUNTRY_TO_REGION[val] ?? "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(apiPath, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": "1" },
        body: JSON.stringify({
          name,
          description,
          country: country || null,
          region: region || null,
          permissionIds: Array.from(selectedIds),
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error?.message || "Failed to save"); return; }
      router.push(returnPath);
    } catch { setError("Network error"); } finally { setSubmitting(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="rounded-lg border bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Role Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">Role Name <span className="text-red-500">*</span></label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Operations Manager - Qatar" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="country" className="mb-1 block text-sm font-medium text-gray-700">Country</label>
            <select id="country" value={country} onChange={(e) => handleCountryChange(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Describe the role responsibilities..." className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="region" className="mb-1 block text-sm font-medium text-gray-700">Region</label>
            <input id="region" type="text" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Auto-populated or manual" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Permission Matrix</h2>
          <span className="text-sm text-gray-500">{selectedIds.size} of {allPermissions.length} selected</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={selectAll} className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
            {selectedIds.size === allPermissions.length ? "Deselect All" : "Select All"}
          </button>
          {["read", "create", "edit", "delete"].map((action) => (
            <button key={action} type="button" onClick={() => selectAllByAction(action)} className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 capitalize">
              Toggle All {action}
            </button>
          ))}
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {grouped.map(([resource, perms]) => {
            const allRes = perms.every((p) => selectedIds.has(p.id));
            const someRes = perms.some((p) => selectedIds.has(p.id));
            return (
              <div key={resource} className="rounded border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <input type="checkbox" checked={allRes} ref={(el) => { if (el) el.indeterminate = someRes && !allRes; }} onChange={() => toggleResource(perms)} className="h-4 w-4 rounded border-gray-300" />
                  <span className="text-sm font-semibold text-gray-700 capitalize">{resource}</span>
                  <span className="text-xs text-gray-400">({perms.filter((p) => selectedIds.has(p.id)).length}/{perms.length})</span>
                </div>
                <div className="flex flex-wrap gap-2 ms-6">
                  {perms.sort((a, b) => a.action.localeCompare(b.action)).map((p) => (
                    <label key={p.id} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs cursor-pointer border ${selectedIds.has(p.id) ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                      <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => togglePerm(p.id)} className="h-3 w-3 rounded border-gray-300" />
                      {p.action}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={submitting} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {submitting ? "Saving..." : isEdit ? "Update Role" : "Create Role"}
        </button>
        <button type="button" onClick={() => router.push(returnPath)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
      </div>
    </form>
  );
}
