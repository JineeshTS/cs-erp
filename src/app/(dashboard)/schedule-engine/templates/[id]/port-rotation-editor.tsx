"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCsrfToken } from "@/lib/client/csrf";
import { Plus, Trash2, Save, Loader2, GripVertical } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface PortCallRow {
  sequence: number;
  portCode: string;
  portName: string;
  portId?: string;
  distanceNm: number | "";
  plannedSpeedKnots: number | "";
  steamingHours: number | "";
  portStayHours: number;
  dayOffset: number;
  cargoCutoffHours: number;
  callPurpose: string;
}

interface PortRotationEditorProps {
  templateId: string;
  initialPortCalls: Array<{
    sequence: number;
    portCode: string;
    portName: string;
    portId: string | null;
    distanceNm: string | null;
    plannedSpeedKnots: string | null;
    steamingHours: string | null;
    portStayHours: string;
    dayOffset: string;
    cargoCutoffHours: number | null;
    callPurpose: string | null;
  }>;
}

function emptyRow(seq: number): PortCallRow {
  return {
    sequence: seq,
    portCode: "",
    portName: "",
    distanceNm: "",
    plannedSpeedKnots: "",
    steamingHours: "",
    portStayHours: 24,
    dayOffset: 0,
    cargoCutoffHours: 48,
    callPurpose: "both",
  };
}

export function PortRotationEditor({ templateId, initialPortCalls }: PortRotationEditorProps) {
  const router = useRouter();
  const [rows, setRows] = useState<PortCallRow[]>(
    initialPortCalls.length > 0
      ? initialPortCalls.map((pc) => ({
          sequence: pc.sequence,
          portCode: pc.portCode,
          portName: pc.portName,
          portId: pc.portId || undefined,
          distanceNm: pc.distanceNm ? Number(pc.distanceNm) : "",
          plannedSpeedKnots: pc.plannedSpeedKnots ? Number(pc.plannedSpeedKnots) : "",
          steamingHours: pc.steamingHours ? Number(pc.steamingHours) : "",
          portStayHours: Number(pc.portStayHours) || 24,
          dayOffset: Number(pc.dayOffset) || 0,
          cargoCutoffHours: pc.cargoCutoffHours || 48,
          callPurpose: pc.callPurpose || "both",
        }))
      : [emptyRow(1), emptyRow(2)]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function updateRow(index: number, field: keyof PortCallRow, value: unknown) {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };

      // Auto-calculate steaming hours from distance and speed
      if ((field === "distanceNm" || field === "plannedSpeedKnots") && next[index].distanceNm && next[index].plannedSpeedKnots) {
        const dist = Number(next[index].distanceNm);
        const speed = Number(next[index].plannedSpeedKnots);
        if (dist > 0 && speed > 0) {
          next[index].steamingHours = Math.round((dist / speed) * 10) / 10;
        }
      }

      return next;
    });
    setSuccess(false);
  }

  function handlePortSelect(index: number, portValue: string) {
    // portValue is the UN/LOCODE. We need to parse the label for the port name.
    // The SearchableSelect entity="ports" returns value=LOCODE, label="Name (LOCODE)"
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], portCode: portValue };
      return next;
    });
    setSuccess(false);
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow(prev.length + 1)]);
  }

  function removeRow(index: number) {
    setRows((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.map((r, i) => ({ ...r, sequence: i + 1 }));
    });
  }

  async function handleSave() {
    // Validate
    for (const row of rows) {
      if (!row.portCode) {
        setError(`Row ${row.sequence}: Port code is required`);
        return;
      }
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/v1/schedule-engine/templates/${templateId}/port-calls`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfToken() },
        body: JSON.stringify({
          portCalls: rows.map((r) => ({
            sequence: r.sequence,
            portCode: r.portCode,
            portName: r.portName || r.portCode,
            portId: r.portId,
            distanceNm: r.distanceNm || undefined,
            plannedSpeedKnots: r.plannedSpeedKnots || undefined,
            steamingHours: r.steamingHours || undefined,
            portStayHours: r.portStayHours,
            dayOffset: r.dayOffset,
            cargoCutoffHours: r.cargoCutoffHours,
            callPurpose: r.callPurpose,
          })),
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message || "Failed to save");
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-gray-100">Port Rotation Editor</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={addRow}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-gray-700 dark:text-gray-300"
          >
            <Plus className="h-3.5 w-3.5" /> Add Port
          </button>
          <button
            onClick={handleSave}
            disabled={saving || rows.length < 2}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {saving ? "Saving..." : "Save Rotation"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
          Port rotation saved successfully
        </div>
      )}

      <div className="rounded-lg border border-slate-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 dark:bg-gray-800/50">
              <th className="w-10 px-2 py-2.5 text-center text-xs font-semibold uppercase text-slate-500">#</th>
              <th className="min-w-[180px] px-2 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Port</th>
              <th className="w-20 px-2 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Code</th>
              <th className="w-24 px-2 py-2.5 text-right text-xs font-semibold uppercase text-slate-500">Dist (nm)</th>
              <th className="w-20 px-2 py-2.5 text-right text-xs font-semibold uppercase text-slate-500">Speed (kn)</th>
              <th className="w-24 px-2 py-2.5 text-right text-xs font-semibold uppercase text-slate-500">Steam (hrs)</th>
              <th className="w-24 px-2 py-2.5 text-right text-xs font-semibold uppercase text-slate-500">Stay (hrs)</th>
              <th className="w-20 px-2 py-2.5 text-right text-xs font-semibold uppercase text-slate-500">Day Off</th>
              <th className="w-20 px-2 py-2.5 text-right text-xs font-semibold uppercase text-slate-500">Cutoff</th>
              <th className="w-10 px-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b last:border-0">
                <td className="px-2 py-1.5 text-center">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 dark:bg-gray-800">
                    {row.sequence}
                  </span>
                </td>
                <td className="px-2 py-1.5">
                  <SearchableSelect
                    entity="ports"
                    value={row.portCode}
                    onChange={(val) => handlePortSelect(index, val)}
                    placeholder="Select port..."
                    className="min-w-[160px]"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="text"
                    value={row.portCode}
                    onChange={(e) => updateRow(index, "portCode", e.target.value)}
                    className="h-8 w-full rounded border border-slate-200 px-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    placeholder="LOCODE"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    value={row.distanceNm}
                    onChange={(e) => updateRow(index, "distanceNm", e.target.value ? Number(e.target.value) : "")}
                    className="h-8 w-full rounded border border-slate-200 px-2 text-right text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    placeholder="—"
                    min="0"
                    step="0.1"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    value={row.plannedSpeedKnots}
                    onChange={(e) => updateRow(index, "plannedSpeedKnots", e.target.value ? Number(e.target.value) : "")}
                    className="h-8 w-full rounded border border-slate-200 px-2 text-right text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    placeholder="—"
                    min="0"
                    max="30"
                    step="0.5"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    value={row.steamingHours}
                    onChange={(e) => updateRow(index, "steamingHours", e.target.value ? Number(e.target.value) : "")}
                    className="h-8 w-full rounded border border-slate-200 px-2 text-right text-xs font-medium text-brand-600 dark:border-gray-700 dark:bg-gray-900"
                    placeholder="auto"
                    min="0"
                    step="0.1"
                    readOnly={!!(row.distanceNm && row.plannedSpeedKnots)}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    value={row.portStayHours}
                    onChange={(e) => updateRow(index, "portStayHours", Number(e.target.value) || 0)}
                    className="h-8 w-full rounded border border-slate-200 px-2 text-right text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    min="0"
                    max="720"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    value={row.dayOffset}
                    onChange={(e) => updateRow(index, "dayOffset", Number(e.target.value) || 0)}
                    className="h-8 w-full rounded border border-slate-200 px-2 text-right text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    min="0"
                    step="0.5"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    value={row.cargoCutoffHours}
                    onChange={(e) => updateRow(index, "cargoCutoffHours", Number(e.target.value) || 48)}
                    className="h-8 w-full rounded border border-slate-200 px-2 text-right text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    min="0"
                  />
                </td>
                <td className="px-2 py-1.5 text-center">
                  {rows.length > 2 && (
                    <button
                      onClick={() => removeRow(index)}
                      className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400 dark:text-gray-500">
        Steaming hours auto-calculate from distance and speed. Minimum 2 ports required.
        Cargo cutoff is hours before departure.
      </p>
    </div>
  );
}
