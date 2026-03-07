import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { SerForm } from "@/components/sustainability-esg-reporting/ser-form";
import type { FieldConfig } from "@/components/sustainability-esg-reporting/ser-form";
import { getVesselOptions, getCustomerOptions } from "@/lib/lookups";

export default async function NewAltFuelTrackingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ser:create")))
    redirect("/sustainability-esg-reporting/alt-fuel-trackings");

  const [vesselOpts, customerOpts] = await Promise.all([
    getVesselOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
  ]);

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
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "quantityMt", label: "Quantity (MT)", type: "text" },
    { name: "costPerMt", label: "Cost Per MT", type: "text" },
    { name: "totalCost", label: "Total Cost", type: "text" },
    { name: "fuelCurrency", label: "Fuel Currency", type: "text" },
    { name: "co2ReductionPct", label: "CO2 Reduction %", type: "text" },
    { name: "supplierName", label: "Supplier Name", type: "select", options: customerOpts },
    { name: "certificationRef", label: "Certification Ref", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/sustainability-esg-reporting/alt-fuel-trackings"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to Alt Fuel Trackings
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">
          New Alt Fuel Tracking
        </h1>
      </div>

      <SerForm
        entityType="Alt Fuel Tracking"
        apiPath="/api/v1/sustainability-esg-reporting/alt-fuel-trackings"
        fields={fields}
        returnPath="/sustainability-esg-reporting/alt-fuel-trackings"
      />
    </div>
  );
}
