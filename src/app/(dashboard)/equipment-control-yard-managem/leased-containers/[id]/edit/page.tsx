import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { eqyLeasedContainers } from "@/db/schema";
import { EqyForm } from "@/components/equipment-control-yard-managem/eqy-form";
import type { FieldConfig } from "@/components/equipment-control-yard-managem/eqy-form";

const LEASE_FIELDS: FieldConfig[] = [
  { name: "leaseReference", label: "Lease Reference", type: "text", required: true },
  { name: "containerFleetId", label: "Container Fleet ID", type: "text" },
  { name: "containerNumber", label: "Container Number", type: "text", required: true },
  { name: "lessorName", label: "Lessor Name", type: "text", required: true },
  { name: "lessorCode", label: "Lessor Code", type: "text" },
  { name: "leaseType", label: "Lease Type", type: "select", options: [
    { value: "master", label: "Master" },
    { value: "spot", label: "Spot" },
    { value: "long_term", label: "Long Term" },
    { value: "short_term", label: "Short Term" },
  ]},
  { name: "leaseStartDate", label: "Lease Start Date", type: "datetime-local", required: true },
  { name: "leaseEndDate", label: "Lease End Date", type: "datetime-local" },
  { name: "dailyRate", label: "Daily Rate", type: "number" },
  { name: "monthlyRate", label: "Monthly Rate", type: "number" },
  { name: "currency", label: "Currency", type: "select", options: [
    { value: "USD", label: "USD" },
    { value: "QAR", label: "QAR" },
    { value: "AED", label: "AED" },
    { value: "SAR", label: "SAR" },
    { value: "INR", label: "INR" },
  ]},
  { name: "billingCycle", label: "Billing Cycle", type: "select", options: [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
  ]},
  { name: "pickUpLocation", label: "Pick-Up Location", type: "text" },
  { name: "dropOffLocation", label: "Drop-Off Location", type: "text" },
  { name: "minimumLeaseDays", label: "Minimum Lease Days", type: "number" },
  { name: "penaltyRate", label: "Penalty Rate", type: "number" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "active", label: "Active" },
    { value: "expiring", label: "Expiring" },
    { value: "expired", label: "Expired" },
    { value: "terminated", label: "Terminated" },
  ]},
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditLeasedContainerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:edit")))
    redirect("/equipment-control-yard-managem/leased-containers");

  const { id } = await params;
  const record = await db
    .select()
    .from(eqyLeasedContainers)
    .where(
      and(
        eq(eqyLeasedContainers.id, id),
        eq(eqyLeasedContainers.tenantId, session.tenantId),
        isNull(eqyLeasedContainers.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    leaseReference: record.leaseReference,
    containerFleetId: record.containerFleetId ?? "",
    containerNumber: record.containerNumber,
    lessorName: record.lessorName,
    lessorCode: record.lessorCode ?? "",
    leaseType: record.leaseType,
    leaseStartDate: record.leaseStartDate?.toISOString() ?? "",
    leaseEndDate: record.leaseEndDate?.toISOString() ?? "",
    dailyRate: record.dailyRate ?? "",
    monthlyRate: record.monthlyRate ?? "",
    currency: record.currency,
    billingCycle: record.billingCycle ?? "",
    pickUpLocation: record.pickUpLocation ?? "",
    dropOffLocation: record.dropOffLocation ?? "",
    minimumLeaseDays: record.minimumLeaseDays ?? "",
    penaltyRate: record.penaltyRate ?? "",
    status: record.status,
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/equipment-control-yard-managem/leased-containers/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Lease Agreement
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <EqyForm
          entityType="Leased Container"
          apiPath={`/api/v1/equipment-control-yard-managem/leased-containers/${id}`}
          fields={LEASE_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/equipment-control-yard-managem/leased-containers/${id}`}
        />
      </div>
    </div>
  );
}
