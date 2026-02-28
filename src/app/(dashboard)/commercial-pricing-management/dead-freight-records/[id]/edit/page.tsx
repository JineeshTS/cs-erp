import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { cpmDeadFreightRecords } from "@/db/schema";
import { CpmForm } from "@/components/commercial-pricing-management/cpm-form";
import type { FieldConfig } from "@/components/commercial-pricing-management/cpm-form";

const fields: FieldConfig[] = [
  { name: "recordReference", label: "Record Reference", type: "text", required: true },
  { name: "voyageReference", label: "Voyage Reference", type: "text" },
  { name: "bookingReference", label: "Booking Reference", type: "text" },
  { name: "customerId", label: "Customer ID", type: "text" },
  { name: "tradeLane", label: "Trade Lane", type: "text" },
  { name: "bookedTeu", label: "Booked TEU", type: "number", required: true },
  { name: "actualTeu", label: "Actual TEU", type: "number", required: true },
  { name: "shortShippedTeu", label: "Short Shipped TEU", type: "number", required: true },
  { name: "ratePerTeu", label: "Rate Per TEU", type: "number", required: true },
  { name: "deadFreightAmount", label: "Dead Freight Amount", type: "number", required: true },
  { name: "recoveredAmount", label: "Recovered Amount", type: "number" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "waiverReason", label: "Waiver Reason", type: "text" },
  { name: "waivedAmount", label: "Waived Amount", type: "number" },
  { name: "invoiceId", label: "Invoice ID", type: "text" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Calculated", value: "calculated" },
      { label: "Invoiced", value: "invoiced" },
      { label: "Partially Recovered", value: "partially_recovered" },
      { label: "Recovered", value: "recovered" },
      { label: "Waived", value: "waived" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditDeadFreightRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  await hasPermission(session.id, session.tenantId, "commercial:read");

  const { id } = await params;

  const [record] = await db
    .select()
    .from(cpmDeadFreightRecords)
    .where(
      and(
        eq(cpmDeadFreightRecords.id, id),
        eq(cpmDeadFreightRecords.tenantId, session.tenantId),
        isNull(cpmDeadFreightRecords.deletedAt)
      )
    )
    .limit(1);

  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/commercial-pricing-management/dead-freight-records/${id}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-semibold">Edit Dead Freight Record</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CpmForm
          entityType="Dead Freight Record"
          fields={fields}
          apiPath={`/api/v1/commercial-pricing-management/dead-freight-records/${id}`}
          returnPath="/commercial-pricing-management/dead-freight-records"
          initialData={{
            recordReference: record.recordReference ?? "",
            voyageReference: record.voyageReference ?? "",
            bookingReference: record.bookingReference ?? "",
            customerId: record.customerId ?? "",
            tradeLane: record.tradeLane ?? "",
            bookedTeu: record.bookedTeu ?? "",
            actualTeu: record.actualTeu ?? "",
            shortShippedTeu: record.shortShippedTeu ?? "",
            ratePerTeu: record.ratePerTeu ?? "",
            deadFreightAmount: record.deadFreightAmount ?? "",
            recoveredAmount: record.recoveredAmount ?? "",
            currency: record.currency ?? "",
            waiverReason: record.waiverReason ?? "",
            waivedAmount: record.waivedAmount ?? "",
            invoiceId: record.invoiceId ?? "",
            status: record.status ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
        />
      </div>
    </div>
  );
}
