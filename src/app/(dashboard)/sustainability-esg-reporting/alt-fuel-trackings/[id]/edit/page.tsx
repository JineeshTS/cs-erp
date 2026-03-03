import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getAltFuelTracking } from "@/lib/sustainability-esg-reporting/service";
import { SerForm } from "@/components/sustainability-esg-reporting/ser-form";
import type { FieldConfig } from "@/components/sustainability-esg-reporting/ser-form";

const fields: FieldConfig[] = [
  {
    name: "trackingType",
    label: "Tracking Type",
    type: "select",
    required: true,
    options: [
      { value: "lng_consumption", label: "LNG Consumption" },
      { value: "methanol_trial", label: "Methanol Trial" },
      { value: "ammonia_pilot", label: "Ammonia Pilot" },
      { value: "hydrogen_test", label: "Hydrogen Test" },
      { value: "biofuel_blend", label: "Biofuel Blend" },
    ],
  },
  { name: "fuelName", label: "Fuel Name", type: "text" },
  { name: "fuelCategory", label: "Fuel Category", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "quantityMt", label: "Quantity (MT)", type: "text" },
  { name: "costPerMt", label: "Cost Per MT", type: "text" },
  { name: "totalCost", label: "Total Cost", type: "text" },
  { name: "fuelCurrency", label: "Fuel Currency", type: "text" },
  { name: "co2ReductionPct", label: "CO2 Reduction %", type: "text" },
  { name: "supplierName", label: "Supplier Name", type: "text" },
  { name: "certificationRef", label: "Certification Ref", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditAltFuelTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ser:edit")))
    redirect("/sustainability-esg-reporting/alt-fuel-trackings");

  const { id } = await params;
  const record = await getAltFuelTracking(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/sustainability-esg-reporting/alt-fuel-trackings/${record.id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to {record.trackingRef}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">
          Edit {record.trackingRef}
        </h1>
      </div>

      <SerForm
        entityType="Alt Fuel Tracking"
        apiPath={`/api/v1/sustainability-esg-reporting/alt-fuel-trackings/${record.id}`}
        fields={fields}
        initialData={{
          trackingType: record.trackingType,
          fuelName: record.fuelName ?? "",
          fuelCategory: record.fuelCategory ?? "",
          vesselName: record.vesselName ?? "",
          quantityMt: record.quantityMt ?? "",
          costPerMt: record.costPerMt ?? "",
          totalCost: record.totalCost ?? "",
          fuelCurrency: record.fuelCurrency ?? "",
          co2ReductionPct: record.co2ReductionPct ?? "",
          supplierName: record.supplierName ?? "",
          certificationRef: record.certificationRef ?? "",
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/sustainability-esg-reporting/alt-fuel-trackings/${record.id}`}
        method="PATCH"
      />
    </div>
  );
}
