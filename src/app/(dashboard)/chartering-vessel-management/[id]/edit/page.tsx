import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { cvmCharterParties } from "@/db/schema";
import { CvmForm } from "@/components/chartering-vessel-management/cvm-form";
import type { FieldConfig } from "@/components/chartering-vessel-management/cvm-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function EditCharterPartyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:edit")))
    redirect("/chartering-vessel-management");

  const vesselOpts = await getVesselOptions(session.tenantId);

  const CP_FIELDS: FieldConfig[] = [
    { name: "cpReference", label: "CP Reference", type: "text", required: true },
    { name: "charterType", label: "Charter Type", type: "select", options: [
      { value: "time_charter", label: "Time Charter" },
      { value: "voyage_charter", label: "Voyage Charter" },
      { value: "bareboat", label: "Bareboat" },
      { value: "coa", label: "COA" },
    ]},
    { name: "chartererName", label: "Charterer Name", type: "text", required: true },
    { name: "ownerName", label: "Owner Name", type: "text" },
    { name: "brokerName", label: "Broker Name", type: "text" },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "vesselImo", label: "Vessel IMO", type: "text" },
    { name: "hireRate", label: "Hire Rate (cents)", type: "number" },
    { name: "hireCurrency", label: "Hire Currency", type: "text" },
    { name: "hirePeriodUnit", label: "Hire Period", type: "select", options: [
      { value: "day", label: "Per Day" },
      { value: "month", label: "Per Month" },
    ]},
    { name: "deliveryPort", label: "Delivery Port", type: "text" },
    { name: "redeliveryPort", label: "Redelivery Port", type: "text" },
    { name: "laycanFrom", label: "Laycan From", type: "datetime-local" },
    { name: "laycanTo", label: "Laycan To", type: "datetime-local" },
    { name: "commencedAt", label: "Commenced At", type: "datetime-local" },
    { name: "terminatedAt", label: "Terminated At", type: "datetime-local" },
    { name: "durationDays", label: "Duration (days)", type: "number" },
    { name: "commissionPercent", label: "Commission %", type: "number" },
    { name: "cpTerms", label: "CP Terms", type: "textarea" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;

  const cp = await db
    .select()
    .from(cvmCharterParties)
    .where(
      and(
        eq(cvmCharterParties.id, id),
        eq(cvmCharterParties.tenantId, session.tenantId),
        isNull(cvmCharterParties.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!cp) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/chartering-vessel-management/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Charter Party
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CvmForm
          entityType="Charter Party"
          apiPath={`/api/v1/chartering-vessel-management/charter-parties/${id}`}
          fields={CP_FIELDS}
          initialData={{
            cpReference: cp.cpReference,
            charterType: cp.charterType,
            chartererName: cp.chartererName,
            ownerName: cp.ownerName ?? "",
            brokerName: cp.brokerName ?? "",
            vesselName: cp.vesselName ?? "",
            vesselImo: cp.vesselImo ?? "",
            hireRate: cp.hireRate ?? "",
            hireCurrency: cp.hireCurrency,
            hirePeriodUnit: cp.hirePeriodUnit,
            deliveryPort: cp.deliveryPort ?? "",
            redeliveryPort: cp.redeliveryPort ?? "",
            laycanFrom: cp.laycanFrom ? cp.laycanFrom.toISOString() : "",
            laycanTo: cp.laycanTo ? cp.laycanTo.toISOString() : "",
            commencedAt: cp.commencedAt ? cp.commencedAt.toISOString() : "",
            terminatedAt: cp.terminatedAt ? cp.terminatedAt.toISOString() : "",
            durationDays: cp.durationDays ?? "",
            commissionPercent: cp.commissionPercent ? Number(cp.commissionPercent) : "",
            cpTerms: cp.cpTerms ?? "",
            notes: cp.notes ?? "",
          }}
          isEdit
          returnPath={`/chartering-vessel-management/${id}`}
        />
      </div>
    </div>
  );
}
