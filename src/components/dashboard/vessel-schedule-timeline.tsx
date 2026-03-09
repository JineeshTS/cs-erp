"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Ship } from "lucide-react";

interface PortCall {
  portName: string;
  portCode: string;
  arrivalEta: string | null;
  departureEtd: string | null;
  actualArrival: string | null;
  actualDeparture: string | null;
  status: string;
  sequenceNumber: number;
}

interface VesselRow {
  vesselName: string;
  serviceName: string;
  scheduleId: string;
  portCalls: PortCall[];
}

interface VesselScheduleTimelineProps {
  vessels: VesselRow[];
  overflowCount: number;
}

function getPortCallStatus(pc: PortCall, now: Date): "on_time" | "approaching" | "delayed" | "departed" | "in_port" {
  if (pc.actualDeparture) return "departed";
  if (pc.actualArrival && !pc.actualDeparture) return "in_port";

  const eta = pc.arrivalEta ? new Date(pc.arrivalEta) : null;
  if (!eta) return "on_time";

  const hoursUntil = (eta.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (pc.actualArrival) {
    const actual = new Date(pc.actualArrival);
    return actual <= eta ? "on_time" : "delayed";
  }

  if (eta < now) return "delayed";
  if (hoursUntil <= 24) return "approaching";
  return "on_time";
}

const statusConfig = {
  on_time: { dot: "bg-emerald-500", label: "On Time", text: "text-emerald-700 dark:text-emerald-400" },
  approaching: { dot: "bg-amber-500", label: "Arriving Soon", text: "text-amber-700 dark:text-amber-400" },
  delayed: { dot: "bg-rose-500", label: "Delayed", text: "text-rose-700 dark:text-rose-400" },
  departed: { dot: "bg-blue-500", label: "Departed", text: "text-blue-700 dark:text-blue-400" },
  in_port: { dot: "bg-violet-500", label: "In Port", text: "text-violet-700 dark:text-violet-400" },
};

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "TBD";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "TBD";
  return d.toLocaleDateString("en", { month: "short", day: "numeric" }) +
    " " +
    d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function getDayLabel(dateStr: string | null, now: Date): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return d.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
}

export function VesselScheduleTimeline({ vessels, overflowCount }: VesselScheduleTimelineProps) {
  const now = new Date();

  if (vessels.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Vessel Schedule</h3>
        <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center">
          <Ship className="h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming vessel movements in the next 7 days</p>
          <Link
            href="/vessels-hub"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            View vessel schedules
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Vessel Schedule — Next 7 Days</h3>
        <Link
          href="/vessels-hub"
          className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          View all
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {vessels.map((vessel) => (
          <div
            key={vessel.scheduleId}
            className="rounded-lg border border-slate-100 p-3 dark:border-slate-800"
          >
            {/* Vessel header */}
            <div className="flex items-center gap-2 mb-2">
              <Ship className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[160px]">
                {vessel.vesselName}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
                {vessel.serviceName}
              </span>
            </div>

            {/* Port calls */}
            <div className="flex flex-wrap gap-2">
              {vessel.portCalls.map((pc, i) => {
                const callStatus = getPortCallStatus(pc, now);
                const cfg = statusConfig[callStatus];
                const etaDate = pc.arrivalEta ?? pc.departureEtd;

                return (
                  <div
                    key={`${pc.portCode}-${pc.sequenceNumber}-${i}`}
                    className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 dark:bg-slate-800/60"
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", cfg.dot)} />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {pc.portName.length > 18 ? pc.portName.slice(0, 18) + "…" : pc.portName}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">
                      {getDayLabel(etaDate, now)}
                    </span>
                    <span className={cn("text-[10px] font-medium", cfg.text)}>
                      {formatTime(etaDate).split(" ").pop()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {overflowCount > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <Link
            href="/vessels-hub"
            className="text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            +{overflowCount} more vessel{overflowCount > 1 ? "s" : ""} with upcoming movements
          </Link>
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
        {(["on_time", "approaching", "delayed", "in_port", "departed"] as const).map((s) => (
          <div key={s} className="flex items-center gap-1">
            <span className={cn("h-1.5 w-1.5 rounded-full", statusConfig[s].dot)} />
            <span className="text-[10px] text-slate-400 dark:text-slate-500">{statusConfig[s].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
