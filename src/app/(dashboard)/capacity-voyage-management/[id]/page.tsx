import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import {
  capVesselSchedules,
  capPortRotations,
  capTradeAllocations,
  capSpaceControls,
  capLoadingLists,
  capBayPlans,
  capStowagePlans,
  capLoadOptimizations,
  capSchedulePerformances,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PortRotation } from "@/types/capacity-voyage-management";
import type { TradeAllocation } from "@/types/capacity-voyage-management";
import type { SpaceControl } from "@/types/capacity-voyage-management";
import type { LoadingList } from "@/types/capacity-voyage-management";
import type { BayPlan } from "@/types/capacity-voyage-management";
import type { StowagePlan } from "@/types/capacity-voyage-management";
import type { LoadOptimization } from "@/types/capacity-voyage-management";
import type { SchedulePerformance } from "@/types/capacity-voyage-management";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "port-rotations", label: "Port Rotations" },
  { key: "trade-allocations", label: "Trade Allocations" },
  { key: "space-controls", label: "Space Controls" },
  { key: "loading-lists", label: "Loading Lists" },
  { key: "bay-plans", label: "Bay Plans" },
  { key: "stowage-plans", label: "Stowage Plans" },
  { key: "load-optimizations", label: "Load Optimizations" },
  { key: "performance", label: "Performance" },
] as const;

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

export default async function VesselScheduleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "capacity:read")))
    redirect("/capacity-voyage-management");

  const { id } = await params;
  const sp = await searchParams;
  const activeTab = sp.tab ?? "overview";

  const vs = await db
    .select()
    .from(capVesselSchedules)
    .where(
      and(
        eq(capVesselSchedules.id, id),
        eq(capVesselSchedules.tenantId, session.tenantId),
        isNull(capVesselSchedules.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!vs) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "capacity:edit"
  );

  let tabData: PortRotation[] | TradeAllocation[] | SpaceControl[] | LoadingList[] | BayPlan[] | StowagePlan[] | LoadOptimization[] | SchedulePerformance[] = [];

  switch (activeTab) {
    case "port-rotations":
      tabData = await db
        .select()
        .from(capPortRotations)
        .where(
          and(
            eq(capPortRotations.vesselScheduleId, id),
            eq(capPortRotations.tenantId, session.tenantId),
            isNull(capPortRotations.deletedAt)
          )
        )
        .orderBy(desc(capPortRotations.createdAt))
        .limit(50);
      break;
    case "trade-allocations":
      tabData = await db
        .select()
        .from(capTradeAllocations)
        .where(
          and(
            eq(capTradeAllocations.vesselScheduleId, id),
            eq(capTradeAllocations.tenantId, session.tenantId),
            isNull(capTradeAllocations.deletedAt)
          )
        )
        .orderBy(desc(capTradeAllocations.createdAt))
        .limit(50);
      break;
    case "space-controls":
      tabData = await db
        .select()
        .from(capSpaceControls)
        .where(
          and(
            eq(capSpaceControls.vesselScheduleId, id),
            eq(capSpaceControls.tenantId, session.tenantId),
            isNull(capSpaceControls.deletedAt)
          )
        )
        .orderBy(desc(capSpaceControls.createdAt))
        .limit(50);
      break;
    case "loading-lists":
      tabData = await db
        .select()
        .from(capLoadingLists)
        .where(
          and(
            eq(capLoadingLists.vesselScheduleId, id),
            eq(capLoadingLists.tenantId, session.tenantId),
            isNull(capLoadingLists.deletedAt)
          )
        )
        .orderBy(desc(capLoadingLists.createdAt))
        .limit(50);
      break;
    case "bay-plans":
      tabData = await db
        .select()
        .from(capBayPlans)
        .where(
          and(
            eq(capBayPlans.vesselScheduleId, id),
            eq(capBayPlans.tenantId, session.tenantId),
            isNull(capBayPlans.deletedAt)
          )
        )
        .orderBy(desc(capBayPlans.createdAt))
        .limit(50);
      break;
    case "stowage-plans":
      tabData = await db
        .select()
        .from(capStowagePlans)
        .where(
          and(
            eq(capStowagePlans.vesselScheduleId, id),
            eq(capStowagePlans.tenantId, session.tenantId),
            isNull(capStowagePlans.deletedAt)
          )
        )
        .orderBy(desc(capStowagePlans.createdAt))
        .limit(50);
      break;
    case "load-optimizations":
      tabData = await db
        .select()
        .from(capLoadOptimizations)
        .where(
          and(
            eq(capLoadOptimizations.vesselScheduleId, id),
            eq(capLoadOptimizations.tenantId, session.tenantId),
            isNull(capLoadOptimizations.deletedAt)
          )
        )
        .orderBy(desc(capLoadOptimizations.createdAt))
        .limit(50);
      break;
    case "performance":
      tabData = await db
        .select()
        .from(capSchedulePerformances)
        .where(
          and(
            eq(capSchedulePerformances.vesselScheduleId, id),
            eq(capSchedulePerformances.tenantId, session.tenantId),
            isNull(capSchedulePerformances.deletedAt)
          )
        )
        .orderBy(desc(capSchedulePerformances.createdAt))
        .limit(50);
      break;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/capacity-voyage-management"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{vs.vesselName}</h1>
          <p className="text-sm text-gray-500">
            {vs.serviceName} &middot; {vs.tradeLane || "No trade lane"}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/capacity-voyage-management/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex gap-4 overflow-x-auto">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={`/capacity-voyage-management/${id}?tab=${tab.key}`}
              className={cn(
                "whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium",
                activeTab === tab.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="rounded-lg border bg-white p-6">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Vessel</dt>
              <dd className="mt-1 text-gray-900">{vs.vesselName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">IMO</dt>
              <dd className="mt-1 text-gray-900">{vs.vesselImo || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Service</dt>
              <dd className="mt-1 text-gray-900">{vs.serviceName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Trade Lane</dt>
              <dd className="mt-1 text-gray-900">{vs.tradeLane || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-gray-900">
                {vs.scheduleType.replace(/_/g, " ")}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Frequency</dt>
              <dd className="mt-1 text-gray-900">{vs.frequency || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Validity From
              </dt>
              <dd className="mt-1 text-gray-900">{fmtDate(vs.validityFrom)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Validity To
              </dt>
              <dd className="mt-1 text-gray-900">{fmtDate(vs.validityTo)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Total Capacity (TEU)
              </dt>
              <dd className="mt-1 text-gray-900">
                {vs.totalCapacityTeu?.toLocaleString() ?? "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Total Weight (MT)
              </dt>
              <dd className="mt-1 text-gray-900">
                {vs.totalWeightMt?.toLocaleString() ?? "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Operator</dt>
              <dd className="mt-1 text-gray-900">
                {vs.operatorName || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <Badge
                  variant={
                    vs.status === "active"
                      ? "success"
                      : vs.status === "suspended"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {vs.status}
                </Badge>
              </dd>
            </div>
            {vs.notes && (
              <div className="sm:col-span-2 lg:col-span-3">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 whitespace-pre-wrap text-gray-900">
                  {vs.notes}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {activeTab === "port-rotations" && (
        <TabTable
          items={tabData as PortRotation[]}
          entityPath="port-rotations"
          scheduleId={id}
          canEdit={canEdit}
          columns={[
            { key: "portName", label: "Port" },
            { key: "portCode", label: "Code" },
            { key: "sequenceNumber", label: "Seq" },
            { key: "arrivalEta", label: "ETA", format: "date" },
            { key: "departureEtd", label: "ETD", format: "date" },
            { key: "callPurpose", label: "Purpose" },
            { key: "status", label: "Status", format: "badge" },
          ]}
        />
      )}

      {activeTab === "trade-allocations" && (
        <TabTable
          items={tabData as TradeAllocation[]}
          entityPath="trade-allocations"
          scheduleId={id}
          canEdit={canEdit}
          columns={[
            { key: "tradeLane", label: "Trade Lane" },
            { key: "originRegion", label: "Origin" },
            { key: "destinationRegion", label: "Destination" },
            { key: "allocatedTeu", label: "Allocated TEU" },
            { key: "utilizedTeu", label: "Utilized TEU" },
            { key: "allocationType", label: "Type" },
            { key: "status", label: "Status", format: "badge" },
          ]}
        />
      )}

      {activeTab === "space-controls" && (
        <TabTable
          items={tabData as SpaceControl[]}
          entityPath="space-controls"
          scheduleId={id}
          canEdit={canEdit}
          columns={[
            { key: "bookingReference", label: "Booking Ref" },
            { key: "containerType", label: "Type" },
            { key: "containerSize", label: "Size" },
            { key: "quantityTeu", label: "TEU" },
            { key: "shipperName", label: "Shipper" },
            { key: "commodity", label: "Commodity" },
            { key: "status", label: "Status", format: "badge" },
          ]}
        />
      )}

      {activeTab === "loading-lists" && (
        <TabTable
          items={tabData as LoadingList[]}
          entityPath="loading-lists"
          scheduleId={id}
          canEdit={canEdit}
          columns={[
            { key: "listReference", label: "Reference" },
            { key: "listType", label: "Type" },
            { key: "totalContainers", label: "Containers" },
            { key: "totalTeu", label: "TEU" },
            { key: "totalWeightMt", label: "Weight (MT)" },
            { key: "status", label: "Status", format: "badge" },
          ]}
        />
      )}

      {activeTab === "bay-plans" && (
        <TabTable
          items={tabData as BayPlan[]}
          entityPath="bay-plans"
          scheduleId={id}
          canEdit={canEdit}
          columns={[
            { key: "planType", label: "Plan Type" },
            { key: "baplieVersion", label: "BAPLIE Ver" },
            { key: "totalSlots", label: "Total Slots" },
            { key: "occupiedSlots", label: "Occupied" },
            { key: "utilizationPercent", label: "Utilization %" },
            { key: "status", label: "Status", format: "badge" },
          ]}
        />
      )}

      {activeTab === "stowage-plans" && (
        <TabTable
          items={tabData as StowagePlan[]}
          entityPath="stowage-plans"
          scheduleId={id}
          canEdit={canEdit}
          columns={[
            { key: "containerNumber", label: "Container" },
            { key: "containerType", label: "Type" },
            { key: "bayNumber", label: "Bay" },
            { key: "rowNumber", label: "Row" },
            { key: "tierNumber", label: "Tier" },
            { key: "weightKg", label: "Weight (kg)" },
            { key: "status", label: "Status", format: "badge" },
          ]}
        />
      )}

      {activeTab === "load-optimizations" && (
        <TabTable
          items={tabData as LoadOptimization[]}
          entityPath="load-optimizations"
          scheduleId={id}
          canEdit={canEdit}
          columns={[
            { key: "optimizationRunId", label: "Run ID" },
            { key: "objective", label: "Objective" },
            { key: "algorithm", label: "Algorithm" },
            { key: "totalTeuBefore", label: "TEU Before" },
            { key: "totalTeuAfter", label: "TEU After" },
            { key: "improvementPercent", label: "Improvement %" },
            { key: "status", label: "Status", format: "badge" },
          ]}
        />
      )}

      {activeTab === "performance" && (
        <TabTable
          items={tabData as SchedulePerformance[]}
          entityPath="schedule-performances"
          scheduleId={id}
          canEdit={canEdit}
          columns={[
            { key: "portName", label: "Port" },
            { key: "scheduledArrival", label: "Sched. Arrival", format: "date" },
            { key: "actualArrival", label: "Actual Arrival", format: "date" },
            { key: "arrivalDelayHours", label: "Delay (hrs)" },
            { key: "onTimeArrival", label: "On Time", format: "boolean" },
            { key: "reliabilityScore", label: "Score" },
            { key: "status", label: "Status", format: "badge" },
          ]}
        />
      )}
    </div>
  );
}

type ColDef = {
  key: string;
  label: string;
  format?: "date" | "badge" | "boolean";
};

function TabTable({
  items,
  entityPath,
  scheduleId,
  canEdit,
  columns,
}: {
  items: Record<string, unknown>[];
  entityPath: string;
  scheduleId: string;
  canEdit: boolean;
  columns: ColDef[];
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-white px-8 py-12 text-center">
        <p className="text-gray-500">No records found.</p>
        {canEdit && (
          <Link
            href={`/capacity-voyage-management/${entityPath}/new?vesselScheduleId=${scheduleId}`}
            className="mt-3 inline-block text-sm text-blue-600 hover:underline"
          >
            Create new
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-start font-medium text-gray-500"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={String(item.id)}
              className="border-b last:border-0 hover:bg-gray-50"
            >
              {columns.map((col, i) => (
                <td key={col.key} className="px-4 py-3">
                  {i === 0 ? (
                    <Link
                      href={`/capacity-voyage-management/${entityPath}/${item.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {formatCell(item[col.key], col.format)}
                    </Link>
                  ) : (
                    <span className={col.format === "badge" ? "" : "text-gray-600"}>
                      {col.format === "badge" ? (
                        <Badge
                          variant={
                            item[col.key] === "active" || item[col.key] === "completed"
                              ? "success"
                              : item[col.key] === "failed" || item[col.key] === "cancelled"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {String(item[col.key] ?? "-")}
                        </Badge>
                      ) : (
                        formatCell(item[col.key], col.format)
                      )}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCell(
  value: unknown,
  format?: "date" | "badge" | "boolean"
): string {
  if (value === null || value === undefined) return "-";
  if (format === "date" && value instanceof Date) {
    return value.toLocaleDateString();
  }
  if (format === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value);
}
