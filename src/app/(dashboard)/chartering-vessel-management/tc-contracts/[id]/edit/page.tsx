import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { cvmTcContracts } from "@/db/schema";
import { CvmForm } from "@/components/chartering-vessel-management/cvm-form";
import type { FieldConfig } from "@/components/chartering-vessel-management/cvm-form";

const TC_FIELDS: FieldConfig[] = [
  {
    name: "direction",
    label: "Direction",
    type: "select",
    required: true,
    options: [
      { value: "tc_in", label: "TC In" },
      { value: "tc_out", label: "TC Out" },
    ],
  },
  { name: "contractReference", label: "Contract Reference", type: "text", required: true },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "counterpartyName", label: "Counterparty Name", type: "text", required: true },
  { name: "brokerName", label: "Broker Name", type: "text" },
  { name: "hireRate", label: "Hire Rate", type: "number", required: true },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  {
    name: "hirePeriodUnit",
    label: "Hire Period Unit",
    type: "select",
    options: [
      { value: "day", label: "Day" },
      { value: "month", label: "Month" },
    ],
  },
  { name: "deliveryPort", label: "Delivery Port", type: "text" },
  { name: "redeliveryPort", label: "Redelivery Port", type: "text" },
  { name: "deliveryDate", label: "Delivery Date", type: "datetime-local" },
  { name: "redeliveryDate", label: "Redelivery Date", type: "datetime-local" },
  { name: "minDuration", label: "Min Duration", type: "number" },
  { name: "maxDuration", label: "Max Duration", type: "number" },
  {
    name: "durationUnit",
    label: "Duration Unit",
    type: "select",
    options: [
      { value: "days", label: "Days" },
      { value: "months", label: "Months" },
    ],
  },
  { name: "commissionPercent", label: "Commission %", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditTcContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:edit")))
    redirect("/chartering-vessel-management");

  const { id } = await params;

  const row = await db
    .select()
    .from(cvmTcContracts)
    .where(
      and(
        eq(cvmTcContracts.id, id),
        eq(cvmTcContracts.tenantId, session.tenantId),
        isNull(cvmTcContracts.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!row) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/chartering-vessel-management/tc-contracts/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit TC Contract
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CvmForm
          entityType="TC Contract"
          apiPath={`/api/v1/chartering-vessel-management/tc-contracts/${id}`}
          fields={TC_FIELDS}
          initialData={{
            direction: row.direction,
            contractReference: row.contractReference,
            vesselName: row.vesselName ?? "",
            counterpartyName: row.counterpartyName,
            brokerName: row.brokerName ?? "",
            hireRate: row.hireRate,
            currency: row.currency,
            hirePeriodUnit: row.hirePeriodUnit,
            deliveryPort: row.deliveryPort ?? "",
            redeliveryPort: row.redeliveryPort ?? "",
            deliveryDate: row.deliveryDate ? row.deliveryDate.toISOString() : "",
            redeliveryDate: row.redeliveryDate ? row.redeliveryDate.toISOString() : "",
            minDuration: row.minDuration ?? "",
            maxDuration: row.maxDuration ?? "",
            durationUnit: row.durationUnit ?? "days",
            commissionPercent: row.commissionPercent ? Number(row.commissionPercent) : "",
            notes: row.notes ?? "",
          }}
          isEdit
          returnPath={`/chartering-vessel-management/tc-contracts/${id}`}
        />
      </div>
    </div>
  );
}
