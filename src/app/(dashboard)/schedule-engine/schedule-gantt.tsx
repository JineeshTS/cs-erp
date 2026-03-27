"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Ship } from "lucide-react";

export type PortCall = {
  id: string;
  voyageId: string;
  sequence: number;
  portCode: string;
  portName: string;
  plannedArrival: string;
  plannedDeparture: string;
  actualArrival: string | null;
  actualDeparture: string | null;
  cargoCutoff: string | null;
  delayHours: string | null;
  delayReason: string | null;
  status: string;
};

export type Voyage = {
  id: string;
  voyageNumber: string;
  startDate: string;
  endDate: string | null;
  status: string;
  isBlankSailing: boolean | null;
  isExtraLoader: boolean | null;
  portCalls: PortCall[];
};

type Props = {
  voyages: Voyage[];
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-500",
  arrived: "bg-amber-500",
  departed: "bg-emerald-500",
  completed: "bg-slate-400 dark:bg-gray-500",
};

const STATUS_BORDER: Record<string, string> = {
  scheduled: "border-blue-600",
  arrived: "border-amber-600",
  departed: "border-emerald-600",
  completed: "border-slate-500",
};

function formatDt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ScheduleGantt({ voyages }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; pc: PortCall } | null>(null);

  if (voyages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-12 dark:border-gray-600">
        <Ship className="h-10 w-10 text-slate-300 dark:text-gray-600" />
        <p className="mt-3 text-sm text-slate-500 dark:text-gray-400">No voyages generated yet</p>
        <Link
          href="/schedule-engine"
          className="mt-2 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Create a template to get started
        </Link>
      </div>
    );
  }

  // Calculate date range from all port calls
  let minTs = Infinity;
  let maxTs = -Infinity;
  for (const v of voyages) {
    for (const pc of v.portCalls) {
      const arr = new Date(pc.plannedArrival).getTime();
      const dep = new Date(pc.plannedDeparture).getTime();
      if (arr < minTs) minTs = arr;
      if (dep > maxTs) maxTs = dep;
    }
    // Fallback to voyage dates if no port calls
    if (v.portCalls.length === 0) {
      const s = new Date(v.startDate).getTime();
      const e = v.endDate ? new Date(v.endDate).getTime() : s + 14 * 86400000;
      if (s < minTs) minTs = s;
      if (e > maxTs) maxTs = e;
    }
  }

  // Pad range by 1 day on each side
  const rangeStart = minTs - 86400000;
  const rangeEnd = maxTs + 86400000;
  const totalRange = Math.max(rangeEnd - rangeStart, 86400000);

  // Generate day markers
  const dayMarkers: { ts: number; label: string }[] = [];
  const firstDay = new Date(rangeStart);
  firstDay.setUTCHours(0, 0, 0, 0);
  let cursor = firstDay.getTime();
  while (cursor <= rangeEnd) {
    dayMarkers.push({ ts: cursor, label: formatDate(new Date(cursor).toISOString()) });
    cursor += 86400000;
  }

  const todayTs = Date.now();
  const todayPct = ((todayTs - rangeStart) / totalRange) * 100;
  const showToday = todayPct >= 0 && todayPct <= 100;

  const ROW_HEIGHT = 44;
  const HEADER_HEIGHT = 28;

  function pct(ts: number): number {
    return ((ts - rangeStart) / totalRange) * 100;
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="overflow-x-auto overflow-y-auto rounded-lg border border-slate-200 dark:border-gray-700"
        style={{ maxHeight: ROW_HEIGHT * 12 + HEADER_HEIGHT }}
      >
        <div className="relative" style={{ minWidth: 900 }}>
          {/* Day header */}
          <div
            className="sticky top-0 z-10 flex border-b bg-slate-50 dark:bg-gray-800/50"
            style={{ height: HEADER_HEIGHT }}
          >
            {/* Voyage label column */}
            <div className="w-28 shrink-0 border-r border-slate-200 px-2 text-[10px] font-semibold uppercase text-slate-500 leading-7 dark:border-gray-700 dark:text-gray-400">
              Voyage
            </div>
            {/* Timeline header */}
            <div className="relative flex-1">
              {dayMarkers.map((d, i) => {
                const left = pct(d.ts);
                if (left < 0 || left > 100) return null;
                return (
                  <span
                    key={i}
                    className="absolute top-0 text-[10px] text-slate-400 dark:text-gray-500"
                    style={{ left: `${left}%`, transform: "translateX(-50%)", lineHeight: `${HEADER_HEIGHT}px` }}
                  >
                    {d.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Voyage rows */}
          {voyages.map((v) => {
            const isBlank = v.isBlankSailing;
            const isExtra = v.isExtraLoader;
            return (
              <div
                key={v.id}
                className="flex border-b border-slate-100 hover:bg-slate-50/50 dark:border-gray-800 dark:hover:bg-gray-800/30"
                style={{ height: ROW_HEIGHT }}
              >
                {/* Voyage label */}
                <div className="flex w-28 shrink-0 items-center border-r border-slate-200 px-2 dark:border-gray-700">
                  <Link
                    href={`/schedule-engine/voyages/${v.id}`}
                    className="truncate text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                    title={v.voyageNumber}
                  >
                    {v.voyageNumber}
                  </Link>
                </div>

                {/* Timeline area */}
                <div className="relative flex-1">
                  {/* Day grid lines */}
                  {dayMarkers.map((d, i) => {
                    const left = pct(d.ts);
                    if (left < 0 || left > 100) return null;
                    return (
                      <div
                        key={i}
                        className="absolute top-0 h-full border-l border-slate-100 dark:border-gray-800"
                        style={{ left: `${left}%` }}
                      />
                    );
                  })}

                  {/* Port call segments */}
                  {v.portCalls.map((pc) => {
                    const arrTs = new Date(pc.plannedArrival).getTime();
                    const depTs = new Date(pc.plannedDeparture).getTime();
                    const leftPct = pct(arrTs);
                    const widthPct = Math.max(((depTs - arrTs) / totalRange) * 100, 0.3);
                    const hasDelay = pc.delayHours && parseFloat(pc.delayHours) > 0;
                    const bgColor = STATUS_COLORS[pc.status] || STATUS_COLORS.scheduled;
                    const borderColor = STATUS_BORDER[pc.status] || STATUS_BORDER.scheduled;

                    return (
                      <div
                        key={pc.id}
                        className={`absolute top-2 flex items-center justify-center rounded border text-[10px] font-medium text-white shadow-sm cursor-pointer transition-opacity hover:opacity-90 ${bgColor} ${borderColor} ${isBlank ? "opacity-50 bg-stripes" : ""} ${isExtra ? "border-dashed" : ""}`}
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          height: ROW_HEIGHT - 16,
                          minWidth: 20,
                        }}
                        onMouseEnter={(e) => {
                          const rect = containerRef.current?.getBoundingClientRect();
                          if (rect) {
                            setTooltip({
                              x: e.clientX - rect.left + 10,
                              y: e.clientY - rect.top - 10,
                              pc,
                            });
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        <span className="truncate px-1">{pc.portCode}</span>
                        {hasDelay && (
                          <AlertTriangle className="ml-0.5 h-3 w-3 shrink-0 text-red-200" />
                        )}
                      </div>
                    );
                  })}

                  {/* Today marker */}
                  {showToday && (
                    <div
                      className="absolute top-0 h-full border-l-2 border-dashed border-red-400 pointer-events-none"
                      style={{ left: `${todayPct}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-50 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-gray-600 dark:bg-gray-800"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <p className="font-semibold text-slate-900 dark:text-gray-100">
            {tooltip.pc.portName} ({tooltip.pc.portCode})
          </p>
          <div className="mt-1 space-y-0.5 text-slate-600 dark:text-gray-400">
            <p>Arrival: {formatDt(tooltip.pc.plannedArrival)}</p>
            <p>Departure: {formatDt(tooltip.pc.plannedDeparture)}</p>
            {tooltip.pc.actualArrival && <p>Actual Arr: {formatDt(tooltip.pc.actualArrival)}</p>}
            {tooltip.pc.actualDeparture && <p>Actual Dep: {formatDt(tooltip.pc.actualDeparture)}</p>}
            {tooltip.pc.cargoCutoff && <p>Cargo Cutoff: {formatDt(tooltip.pc.cargoCutoff)}</p>}
            {tooltip.pc.delayHours && parseFloat(tooltip.pc.delayHours) > 0 && (
              <p className="text-red-500">
                Delay: +{tooltip.pc.delayHours}h{tooltip.pc.delayReason ? ` (${tooltip.pc.delayReason})` : ""}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-slate-500 dark:text-gray-400">
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded bg-blue-500" /> Scheduled</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded bg-amber-500" /> Arrived</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded bg-emerald-500" /> Departed</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded bg-slate-400" /> Completed</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-5 rounded border border-dashed border-slate-400 bg-slate-200" /> Extra Loader</span>
        <span className="flex items-center gap-1 text-red-400">| Today</span>
      </div>
    </div>
  );
}
