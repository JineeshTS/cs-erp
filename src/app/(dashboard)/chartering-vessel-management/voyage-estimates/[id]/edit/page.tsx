import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { cvmVoyageEstimates } from "@/db/schema";
import { CvmForm } from "@/components/chartering-vessel-management/cvm-form";
import type { FieldConfig } from "@/components/chartering-vessel-management/cvm-form";

const VE_FIELDS: FieldConfig[] = [
  { name: "charterPartyId", label: "Charter Party ID", type: "text", placeholder: "UUID" },
  { name: "voyageNumber", label: "Voyage Number", type: "text", required: true },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "originPort", label: "Origin Port", type: "text" },
  { name: "destinationPort", label: "Destination Port", type: "text" },
  { name: "cargoType", label: "Cargo Type", type: "text" },
  { name: "cargoQuantity", label: "Cargo Quantity", type: "number" },
  { name: "cargoUnit", label: "Cargo Unit", type: "select", options: [
    { value: "MT", label: "MT" },
    { value: "TEU", label: "TEU" },
  ]},
  { name: "estimatedRevenue", label: "Estimated Revenue", type: "number" },
  { name: "bunkerCost", label: "Bunker Cost", type: "number" },
  { name: "portCost", label: "Port Cost", type: "number" },
  { name: "canalCost", label: "Canal Cost", type: "number" },
  { name: "otherCosts", label: "Other Costs", type: "number" },
  { name: "totalCost", label: "Total Cost", type: "number" },
  { name: "netResult", label: "Net Result", type: "number" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "voyageDays", label: "Voyage Days", type: "number" },
  { name: "seaDays", label: "Sea Days", type: "number" },
  { name: "portDays", label: "Port Days", type: "number" },
  { name: "distanceNm", label: "Distance (NM)", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditVoyageEstimatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:edit")))
    redirect("/chartering-vessel-management");

  const { id } = await params;

  const ve = await db
    .select()
    .from(cvmVoyageEstimates)
    .where(
      and(
        eq(cvmVoyageEstimates.id, id),
        eq(cvmVoyageEstimates.tenantId, session.tenantId),
        isNull(cvmVoyageEstimates.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!ve) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/chartering-vessel-management/voyage-estimates/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Voyage Estimate
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CvmForm
          entityType="Voyage Estimate"
          apiPath={`/api/v1/chartering-vessel-management/voyage-estimates/${id}`}
          fields={VE_FIELDS}
          initialData={{
            charterPartyId: ve.charterPartyId ?? "",
            voyageNumber: ve.voyageNumber,
            vesselName: ve.vesselName ?? "",
            originPort: ve.originPort ?? "",
            destinationPort: ve.destinationPort ?? "",
            cargoType: ve.cargoType ?? "",
            cargoQuantity: ve.cargoQuantity ? Number(ve.cargoQuantity) : "",
            cargoUnit: ve.cargoUnit ?? "",
            estimatedRevenue: ve.estimatedRevenue ? Number(ve.estimatedRevenue) : "",
            bunkerCost: ve.bunkerCost ? Number(ve.bunkerCost) : "",
            portCost: ve.portCost ? Number(ve.portCost) : "",
            canalCost: ve.canalCost ? Number(ve.canalCost) : "",
            otherCosts: ve.otherCosts ? Number(ve.otherCosts) : "",
            totalCost: ve.totalCost ? Number(ve.totalCost) : "",
            netResult: ve.netResult ? Number(ve.netResult) : "",
            currency: ve.currency,
            voyageDays: ve.voyageDays ? Number(ve.voyageDays) : "",
            seaDays: ve.seaDays ? Number(ve.seaDays) : "",
            portDays: ve.portDays ? Number(ve.portDays) : "",
            distanceNm: ve.distanceNm ? Number(ve.distanceNm) : "",
            notes: ve.notes ?? "",
          }}
          isEdit
          returnPath={`/chartering-vessel-management/voyage-estimates/${id}`}
        />
      </div>
    </div>
  );
}
