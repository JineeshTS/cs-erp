import Link from "next/link";
import { ArrowLeft, MapPin, Clock, AlertTriangle } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { generatedVoyages, voyagePortCalls, proformaTemplates } from "@/db/schema/schedule-engine";
import { eq, and, isNull, asc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { VoyageCosting } from "./voyage-costing";

function formatDateTime(d: Date | string | null): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " " + date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function VoyageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const [voyage] = await db
    .select()
    .from(generatedVoyages)
    .where(and(
      eq(generatedVoyages.id, id),
      eq(generatedVoyages.tenantId, session.tenantId),
      isNull(generatedVoyages.deletedAt),
    ))
    .limit(1);

  if (!voyage) notFound();

  const [template] = await db
    .select({ serviceName: proformaTemplates.serviceName, serviceCode: proformaTemplates.serviceCode })
    .from(proformaTemplates)
    .where(eq(proformaTemplates.id, voyage.templateId))
    .limit(1);

  const portCalls = await db
    .select()
    .from(voyagePortCalls)
    .where(and(
      eq(voyagePortCalls.voyageId, id),
      eq(voyagePortCalls.tenantId, session.tenantId),
    ))
    .orderBy(asc(voyagePortCalls.sequence));

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/schedule-engine" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-gray-800">
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-100">Voyage {voyage.voyageNumber}</h1>
            <Badge variant={voyage.status === "planned" ? "secondary" : "default"}>{voyage.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            {template?.serviceName || "Unknown"} ({template?.serviceCode || "?"}) · Cycle {voyage.cycleNumber || "—"}
          </p>
        </div>
      </div>

      {/* Voyage Summary */}
      <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900 md:grid-cols-4">
        <div>
          <p className="text-xs font-medium uppercase text-slate-400">Start Date</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-gray-100">{formatDate(voyage.startDate)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-slate-400">End Date</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-gray-100">{formatDate(voyage.endDate)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-slate-400">Port Calls</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-gray-100">{portCalls.length}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-slate-400">Cycle</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-gray-100">{voyage.cycleNumber || "—"}</p>
        </div>
      </div>

      {/* Port Call Schedule */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-gray-100">Port Call Schedule</h2>
        <div className="rounded-lg border border-slate-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-gray-800/50">
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Seq</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Port</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Code</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Planned Arrival</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Planned Departure</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Actual Arrival</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Actual Departure</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Cargo Cutoff</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {portCalls.map((pc) => {
                const hasDelay = pc.delayHours && Number(pc.delayHours) > 0;
                return (
                  <tr key={pc.id} className="border-b last:border-0">
                    <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-gray-100">{pc.sequence}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium text-slate-900 dark:text-gray-100">{pc.portName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-gray-400">{pc.portCode}</td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-gray-400">{formatDateTime(pc.plannedArrival)}</td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-gray-400">{formatDateTime(pc.plannedDeparture)}</td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-gray-400">
                      {pc.actualArrival ? formatDateTime(pc.actualArrival) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-gray-400">
                      {pc.actualDeparture ? formatDateTime(pc.actualDeparture) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-gray-400">
                      {pc.cargoCutoff ? formatDateTime(pc.cargoCutoff) : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <Badge variant={pc.status === "scheduled" ? "secondary" : pc.status === "departed" ? "default" : "outline"}>
                          {pc.status}
                        </Badge>
                        {hasDelay && (
                          <span className="flex items-center gap-0.5 text-xs text-red-500">
                            <AlertTriangle className="h-3 w-3" />
                            +{Number(pc.delayHours).toFixed(1)}h
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Voyage Costing */}
      <VoyageCosting voyageId={id} />
    </div>
  );
}
