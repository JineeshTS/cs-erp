import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { eqyOnHireOffHire } from "@/db/schema";
import { EqyForm } from "@/components/equipment-control-yard-managem/eqy-form";
import type { FieldConfig } from "@/components/equipment-control-yard-managem/eqy-form";

const HIRE_FIELDS: FieldConfig[] = [
  { name: "contractReference", label: "Contract Reference", type: "text", required: true },
  { name: "containerNumber", label: "Container Number", type: "text", required: true },
  { name: "containerFleetId", label: "Container Fleet ID", type: "text" },
  { name: "lessorName", label: "Lessor Name", type: "text" },
  { name: "lesseeName", label: "Lessee Name", type: "text" },
  { name: "hireType", label: "Hire Type", type: "select", required: true, options: [
    { value: "on_hire", label: "On Hire" },
    { value: "off_hire", label: "Off Hire" },
  ]},
  { name: "onHireDate", label: "On-Hire Date", type: "datetime-local", required: true },
  { name: "offHireDate", label: "Off-Hire Date", type: "datetime-local" },
  { name: "onHireLocation", label: "On-Hire Location", type: "text" },
  { name: "offHireLocation", label: "Off-Hire Location", type: "text" },
  { name: "dailyRate", label: "Daily Rate", type: "number" },
  { name: "currency", label: "Currency", type: "select", options: [
    { value: "USD", label: "USD" },
    { value: "QAR", label: "QAR" },
    { value: "AED", label: "AED" },
    { value: "SAR", label: "SAR" },
    { value: "INR", label: "INR" },
  ]},
  { name: "totalDays", label: "Total Days", type: "number" },
  { name: "totalCost", label: "Total Cost", type: "number" },
  { name: "conditionOnHire", label: "Condition On Hire", type: "text" },
  { name: "conditionOffHire", label: "Condition Off Hire", type: "text" },
  { name: "damageCharges", label: "Damage Charges", type: "number" },
  { name: "cleaningCharges", label: "Cleaning Charges", type: "number" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "active", label: "Active" },
    { value: "pending_off_hire", label: "Pending Off-Hire" },
    { value: "off_hired", label: "Off-Hired" },
    { value: "disputed", label: "Disputed" },
  ]},
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditOnHireOffHirePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "equipment:edit")))
    redirect("/equipment-control-yard-managem/on-hire-off-hire");

  const { id } = await params;
  const record = await db
    .select()
    .from(eqyOnHireOffHire)
    .where(
      and(
        eq(eqyOnHireOffHire.id, id),
        eq(eqyOnHireOffHire.tenantId, session.tenantId),
        isNull(eqyOnHireOffHire.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    contractReference: record.contractReference,
    containerNumber: record.containerNumber,
    containerFleetId: record.containerFleetId ?? "",
    lessorName: record.lessorName ?? "",
    lesseeName: record.lesseeName ?? "",
    hireType: record.hireType,
    onHireDate: record.onHireDate?.toISOString() ?? "",
    offHireDate: record.offHireDate?.toISOString() ?? "",
    onHireLocation: record.onHireLocation ?? "",
    offHireLocation: record.offHireLocation ?? "",
    dailyRate: record.dailyRate ?? "",
    currency: record.currency,
    totalDays: record.totalDays ?? "",
    totalCost: record.totalCost ?? "",
    conditionOnHire: record.conditionOnHire ?? "",
    conditionOffHire: record.conditionOffHire ?? "",
    damageCharges: record.damageCharges ?? "",
    cleaningCharges: record.cleaningCharges ?? "",
    status: record.status,
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/equipment-control-yard-managem/on-hire-off-hire/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Hire Contract
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <EqyForm
          entityType="On-Hire/Off-Hire"
          apiPath={`/api/v1/equipment-control-yard-managem/on-hire-off-hire/${id}`}
          fields={HIRE_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/equipment-control-yard-managem/on-hire-off-hire/${id}`}
        />
      </div>
    </div>
  );
}
