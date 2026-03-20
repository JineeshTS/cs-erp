import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import {
  eqyContainerFleet,
  eqyRepositioningPlans,
  eqyReeferContainers,
  eqyMaintenanceRepairs,
  eqyYardSlots,
  eqyGateMovements,
  eqyEquipmentInterchanges,
  eqyOnHireOffHire,
  eqyContainerSurveys,
  eqyLeasedContainers,
  eqyAvailabilityPlans,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DeleteButton } from "@/components/ui/delete-button";


const TABS = [
  { key: "overview", label: "Overview" },
  { key: "repositioning-plans", label: "Repositioning" },
  { key: "reefer-containers", label: "Reefer" },
  { key: "maintenance-repairs", label: "MNR" },
  { key: "yard-slots", label: "Yard Slots" },
  { key: "gate-movements", label: "Gate Moves" },
  { key: "equipment-interchanges", label: "Interchanges" },
  { key: "on-hire-off-hire", label: "Hire" },
  { key: "container-surveys", label: "Surveys" },
  { key: "leased-containers", label: "Leases" },
  { key: "availability-plans", label: "Availability" },
] as const;

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "-";
}

export default async function ContainerFleetDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:read")))
    redirect("/equipment-control-yard-managem");

  const { id } = await params;
  const sp = await searchParams;
  const activeTab = sp.tab ?? "overview";

  const record = await db
    .select()
    .from(eqyContainerFleet)
    .where(
      and(
        eq(eqyContainerFleet.id, id),
        eq(eqyContainerFleet.tenantId, session.tenantId),
        isNull(eqyContainerFleet.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "equipment:edit"
  );
  const canDelete = await hasPermission(
    session.id,
    session.tenantId,
    "equipment:delete"
  );

  const [
    repositioningPlans,
    reeferContainers,
    maintenanceRepairs,
    yardSlots,
    gateMovements,
    equipmentInterchanges,
    onHireOffHire,
    containerSurveys,
    leasedContainers,
    availabilityPlans,
  ] = await Promise.all([
    db.select().from(eqyRepositioningPlans).where(and(eq(eqyRepositioningPlans.tenantId, session.tenantId), isNull(eqyRepositioningPlans.deletedAt), eq(eqyRepositioningPlans.containerFleetId, id))).orderBy(desc(eqyRepositioningPlans.createdAt)).limit(50),
    db.select().from(eqyReeferContainers).where(and(eq(eqyReeferContainers.tenantId, session.tenantId), isNull(eqyReeferContainers.deletedAt), eq(eqyReeferContainers.containerFleetId, id))).orderBy(desc(eqyReeferContainers.createdAt)).limit(50),
    db.select().from(eqyMaintenanceRepairs).where(and(eq(eqyMaintenanceRepairs.tenantId, session.tenantId), isNull(eqyMaintenanceRepairs.deletedAt), eq(eqyMaintenanceRepairs.containerFleetId, id))).orderBy(desc(eqyMaintenanceRepairs.createdAt)).limit(50),
    db.select().from(eqyYardSlots).where(and(eq(eqyYardSlots.tenantId, session.tenantId), isNull(eqyYardSlots.deletedAt), eq(eqyYardSlots.assignedContainerId, id))).orderBy(desc(eqyYardSlots.createdAt)).limit(50),
    db.select().from(eqyGateMovements).where(and(eq(eqyGateMovements.tenantId, session.tenantId), isNull(eqyGateMovements.deletedAt), eq(eqyGateMovements.containerFleetId, id))).orderBy(desc(eqyGateMovements.createdAt)).limit(50),
    db.select().from(eqyEquipmentInterchanges).where(and(eq(eqyEquipmentInterchanges.tenantId, session.tenantId), isNull(eqyEquipmentInterchanges.deletedAt), eq(eqyEquipmentInterchanges.containerFleetId, id))).orderBy(desc(eqyEquipmentInterchanges.createdAt)).limit(50),
    db.select().from(eqyOnHireOffHire).where(and(eq(eqyOnHireOffHire.tenantId, session.tenantId), isNull(eqyOnHireOffHire.deletedAt), eq(eqyOnHireOffHire.containerFleetId, id))).orderBy(desc(eqyOnHireOffHire.createdAt)).limit(50),
    db.select().from(eqyContainerSurveys).where(and(eq(eqyContainerSurveys.tenantId, session.tenantId), isNull(eqyContainerSurveys.deletedAt), eq(eqyContainerSurveys.containerFleetId, id))).orderBy(desc(eqyContainerSurveys.createdAt)).limit(50),
    db.select().from(eqyLeasedContainers).where(and(eq(eqyLeasedContainers.tenantId, session.tenantId), isNull(eqyLeasedContainers.deletedAt), eq(eqyLeasedContainers.containerFleetId, id))).orderBy(desc(eqyLeasedContainers.createdAt)).limit(50),
    db.select().from(eqyAvailabilityPlans).where(and(eq(eqyAvailabilityPlans.tenantId, session.tenantId), isNull(eqyAvailabilityPlans.deletedAt))).orderBy(desc(eqyAvailabilityPlans.createdAt)).limit(50),
  ]);

  const tabData: Record<string, { headers: string[]; rows: string[][] }> = {
    "repositioning-plans": {
      headers: ["Reference", "From", "To", "Mode", "Status"],
      rows: repositioningPlans.map((r) => [r.planReference, r.fromPort, r.toPort, r.transportMode, r.status]),
    },
    "reefer-containers": {
      headers: ["Container", "Model", "Set Temp", "Power", "Status"],
      rows: reeferContainers.map((r) => [r.containerNumber, r.reeferUnitModel ?? "-", r.setTemperature ?? "-", r.powerStatus ?? "-", r.status]),
    },
    "maintenance-repairs": {
      headers: ["Reference", "Type", "Vendor", "Est. Cost", "Status"],
      rows: maintenanceRepairs.map((r) => [r.mnrReference, r.repairType, r.repairVendor ?? "-", r.estimatedCost?.toString() ?? "-", r.status]),
    },
    "yard-slots": {
      headers: ["Yard", "Block", "Bay/Row/Tier", "Type", "Status"],
      rows: yardSlots.map((r) => [r.yardName, r.blockCode ?? "-", `${r.bayCode ?? "-"}/${r.rowCode ?? "-"}/${r.tierCode ?? "-"}`, r.slotType, r.status]),
    },
    "gate-movements": {
      headers: ["Reference", "Type", "Container", "Gate", "Status"],
      rows: gateMovements.map((r) => [r.movementReference, r.movementType, r.containerNumber, r.gateCode ?? "-", r.status]),
    },
    "equipment-interchanges": {
      headers: ["Reference", "Type", "From", "To", "Status"],
      rows: equipmentInterchanges.map((r) => [r.interchangeReference, r.interchangeType, r.partyFrom, r.partyTo, r.status]),
    },
    "on-hire-off-hire": {
      headers: ["Contract", "Type", "On-Hire Date", "Location", "Status"],
      rows: onHireOffHire.map((r) => [r.contractReference, r.hireType, fmtDate(r.onHireDate), r.onHireLocation ?? "-", r.status]),
    },
    "container-surveys": {
      headers: ["Reference", "Type", "Date", "Condition", "Status"],
      rows: containerSurveys.map((r) => [r.surveyReference, r.surveyType, fmtDate(r.surveyDate), r.overallCondition ?? "-", r.status]),
    },
    "leased-containers": {
      headers: ["Reference", "Lessor", "Type", "Start", "Status"],
      rows: leasedContainers.map((r) => [r.leaseReference, r.lessorName, r.leaseType, fmtDate(r.leaseStartDate), r.status]),
    },
    "availability-plans": {
      headers: ["Reference", "Trade Lane", "Available", "Demand", "Status"],
      rows: availabilityPlans.map((r) => [r.planReference, r.tradeLane ?? "-", r.availableUnits?.toString() ?? "-", r.demandForecast?.toString() ?? "-", r.status]),
    },
  };

  const currentTab = tabData[activeTab];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/equipment-control-yard-managem"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.containerNumber}
          </h1>
          <p className="text-sm text-gray-500">
            {record.sizeCode} / {record.typeCode} &mdash;{" "}
            {record.ownershipType.replace(/_/g, " ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/equipment-control-yard-managem/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          )}
          {canDelete && (
            <DeleteButton apiPath={`/api/v1/equipment-control-yard-managem/container-fleet/${id}`} />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border bg-gray-50 p-1">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/equipment-control-yard-managem/${id}?tab=${tab.key}`}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" ? (
        <div className="rounded-lg border bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Container Number", value: record.containerNumber },
              { label: "ISO Type Code", value: record.isoTypeCode ?? "-" },
              { label: "Size Code", value: record.sizeCode },
              { label: "Type Code", value: record.typeCode },
              { label: "Owner Code", value: record.ownerCode ?? "-" },
              { label: "Operator Code", value: record.operatorCode ?? "-" },
              { label: "Ownership Type", value: record.ownershipType.replace(/_/g, " ") },
              { label: "Current Location", value: record.currentLocation ?? "-" },
              { label: "Current Port", value: record.currentPort ?? "-" },
              { label: "Current Status", value: record.currentStatus.replace(/_/g, " ") },
              { label: "Last Movement", value: fmtDate(record.lastMovementDate) },
              { label: "Last Survey", value: fmtDate(record.lastSurveyDate) },
              { label: "Build Date", value: fmtDate(record.buildDate) },
              { label: "Manufacturer", value: record.manufacturer ?? "-" },
              { label: "Tare Weight (kg)", value: record.tareWeightKg?.toLocaleString() ?? "-" },
              { label: "Max Gross (kg)", value: record.maxGrossWeightKg?.toLocaleString() ?? "-" },
              { label: "Capacity (CBM)", value: record.capacityCbm ? Number(record.capacityCbm).toFixed(2) : "-" },
              { label: "Status", value: record.status },
            ].map((field) => (
              <div key={field.label}>
                <p className="text-xs font-medium text-gray-500">
                  {field.label}
                </p>
                <p className="mt-0.5 text-sm text-gray-900">{field.value}</p>
              </div>
            ))}
          </div>
          {record.notes && (
            <div className="mt-6 border-t pt-4">
              <p className="text-xs font-medium text-gray-500">Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                {record.notes}
              </p>
            </div>
          )}
        </div>
      ) : currentTab ? (
        currentTab.rows.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <p className="text-gray-500">No records found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  {currentTab.headers.map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-start font-medium text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentTab.rows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-3 text-gray-600">
                        {j === row.length - 1 ? (
                          <Badge variant="secondary">
                            {String(cell).replace(/_/g, " ")}
                          </Badge>
                        ) : (
                          String(cell)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </div>
  );
}
