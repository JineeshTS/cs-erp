import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { cvmLaytimeCalculations } from "@/db/schema";
import { CvmForm } from "@/components/chartering-vessel-management/cvm-form";
import type { FieldConfig } from "@/components/chartering-vessel-management/cvm-form";
import { getPortOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditLaytimeCalculationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:edit")))
    redirect("/chartering-vessel-management");

  const [portOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const LC_FIELDS: FieldConfig[] = [
    { name: "charterPartyId", label: "Charter Party ID", type: "text", placeholder: "UUID" },
    { name: "voyageEstimateId", label: "Voyage Estimate ID", type: "text", placeholder: "UUID" },
    { name: "portName", label: "Port Name", type: "select", options: portOpts, required: true },
    { name: "operationType", label: "Operation Type", type: "select", options: [
      { value: "loading", label: "Loading" },
      { value: "discharging", label: "Discharging" },
    ]},
    { name: "allowedHours", label: "Allowed Hours", type: "number", required: true },
    { name: "usedHours", label: "Used Hours", type: "number", required: true },
    { name: "excessHours", label: "Excess Hours", type: "number" },
    { name: "demurrageRate", label: "Demurrage Rate", type: "number" },
    { name: "despatchRate", label: "Despatch Rate", type: "number" },
    { name: "demurrageAmount", label: "Demurrage Amount", type: "number" },
    { name: "despatchAmount", label: "Despatch Amount", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "commencedAt", label: "Commenced At", type: "datetime-local" },
    { name: "completedAt", label: "Completed At", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;

  const lc = await db
    .select()
    .from(cvmLaytimeCalculations)
    .where(
      and(
        eq(cvmLaytimeCalculations.id, id),
        eq(cvmLaytimeCalculations.tenantId, session.tenantId),
        isNull(cvmLaytimeCalculations.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!lc) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/chartering-vessel-management/laytime-calculations/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Laytime Calculation
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CvmForm
          entityType="Laytime Calculation"
          apiPath={`/api/v1/chartering-vessel-management/laytime-calculations/${id}`}
          fields={LC_FIELDS}
          initialData={{
            charterPartyId: lc.charterPartyId ?? "",
            voyageEstimateId: lc.voyageEstimateId ?? "",
            portName: lc.portName,
            operationType: lc.operationType,
            allowedHours: Number(lc.allowedHours),
            usedHours: Number(lc.usedHours),
            excessHours: lc.excessHours ? Number(lc.excessHours) : "",
            demurrageRate: lc.demurrageRate ? Number(lc.demurrageRate) : "",
            despatchRate: lc.despatchRate ? Number(lc.despatchRate) : "",
            demurrageAmount: lc.demurrageAmount ? Number(lc.demurrageAmount) : "",
            despatchAmount: lc.despatchAmount ? Number(lc.despatchAmount) : "",
            currency: lc.currency,
            commencedAt: lc.commencedAt ? lc.commencedAt.toISOString() : "",
            completedAt: lc.completedAt ? lc.completedAt.toISOString() : "",
            notes: lc.notes ?? "",
          }}
          isEdit
          returnPath={`/chartering-vessel-management/laytime-calculations/${id}`}
        />
      </div>
    </div>
  );
}
