"use client";

import { useState, useEffect } from "react";
import { DollarSign, Loader2, Fuel, Anchor } from "lucide-react";

interface PortCost {
  portCode: string;
  portName: string;
  pilotage: number;
  towage: number;
  berthHire: number;
  portDues: number;
  total: number;
}

interface BunkerCost {
  fromPort: string;
  toPort: string;
  distanceNm: number;
  fuelConsumedMt: number;
  totalCost: number;
}

interface CostSummary {
  totalPortCosts: number;
  totalBunkerCosts: number;
  canalFees: number;
  insurance: number;
  charterHire: number;
  totalCosts: number;
  currency: string;
  portDisbursements: PortCost[];
  bunkerCosts: BunkerCost[];
}

export function VoyageCosting({ voyageId }: { voyageId: string }) {
  const [data, setData] = useState<CostSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadCosting() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/schedule-engine/voyages/${voyageId}/costing`);
      if (!res.ok) throw new Error("Failed to load costing");
      const json = await res.json();
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading costing");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-gray-100">
          <DollarSign className="h-5 w-5 text-green-600" />
          Voyage Costing
        </h2>
        <button
          onClick={loadCosting}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <DollarSign className="h-3.5 w-3.5" />}
          {loading ? "Calculating..." : data ? "Recalculate" : "Calculate Costs"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          {/* Cost Summary Cards */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <p className="text-xs font-medium uppercase text-slate-400">Port Costs</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-gray-100">
                ${data.totalPortCosts.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <p className="text-xs font-medium uppercase text-slate-400">Bunker</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-gray-100">
                ${data.totalBunkerCosts.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <p className="text-xs font-medium uppercase text-slate-400">Insurance</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-gray-100">
                ${data.insurance.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <p className="text-xs font-medium uppercase text-slate-400">Charter</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-gray-100">
                ${data.charterHire.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-900/20">
              <p className="text-xs font-medium uppercase text-brand-600">Total Cost</p>
              <p className="mt-1 text-lg font-bold text-brand-700 dark:text-brand-400">
                ${data.totalCosts.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Port Disbursements Table */}
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-gray-300">
              <Anchor className="h-4 w-4" /> Port Disbursements
            </h3>
            <div className="rounded-lg border border-slate-200 dark:border-gray-700 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-slate-50 dark:bg-gray-800/50">
                    <th className="px-3 py-2 text-left font-semibold uppercase text-slate-500">Port</th>
                    <th className="px-3 py-2 text-right font-semibold uppercase text-slate-500">Pilotage</th>
                    <th className="px-3 py-2 text-right font-semibold uppercase text-slate-500">Towage</th>
                    <th className="px-3 py-2 text-right font-semibold uppercase text-slate-500">Berth</th>
                    <th className="px-3 py-2 text-right font-semibold uppercase text-slate-500">Port Dues</th>
                    <th className="px-3 py-2 text-right font-semibold uppercase text-slate-500 text-brand-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.portDisbursements.map((p) => (
                    <tr key={p.portCode} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium text-slate-900 dark:text-gray-100">{p.portName} ({p.portCode})</td>
                      <td className="px-3 py-2 text-right text-slate-600 dark:text-gray-400">${p.pilotage}</td>
                      <td className="px-3 py-2 text-right text-slate-600 dark:text-gray-400">${p.towage}</td>
                      <td className="px-3 py-2 text-right text-slate-600 dark:text-gray-400">${p.berthHire}</td>
                      <td className="px-3 py-2 text-right text-slate-600 dark:text-gray-400">${p.portDues}</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-900 dark:text-gray-100">${p.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bunker Costs Table */}
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-gray-300">
              <Fuel className="h-4 w-4" /> Bunker Fuel Costs
            </h3>
            <div className="rounded-lg border border-slate-200 dark:border-gray-700 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-slate-50 dark:bg-gray-800/50">
                    <th className="px-3 py-2 text-left font-semibold uppercase text-slate-500">Leg</th>
                    <th className="px-3 py-2 text-right font-semibold uppercase text-slate-500">Distance (nm)</th>
                    <th className="px-3 py-2 text-right font-semibold uppercase text-slate-500">Fuel (mt)</th>
                    <th className="px-3 py-2 text-right font-semibold uppercase text-slate-500 text-brand-600">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bunkerCosts.map((b, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium text-slate-900 dark:text-gray-100">{b.fromPort} → {b.toPort}</td>
                      <td className="px-3 py-2 text-right text-slate-600 dark:text-gray-400">{b.distanceNm}</td>
                      <td className="px-3 py-2 text-right text-slate-600 dark:text-gray-400">{b.fuelConsumedMt} mt</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-900 dark:text-gray-100">${b.totalCost.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
