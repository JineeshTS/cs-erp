import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { SerForm, type FieldConfig } from "@/components/sustainability-esg-reporting/ser-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function NewCarbonFootprintPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "ser:create"))
  )
    redirect("/sustainability-esg-reporting/carbon-footprints");

  const vesselOpts = await getVesselOptions(session.tenantId);

  const CARBON_FOOTPRINT_FIELDS: FieldConfig[] = [
    {
      name: "footprintType",
      label: "Footprint Type",
      type: "select",
      required: true,
      options: [
        { value: "voyage_emission", label: "Voyage Emission" },
        { value: "port_emission", label: "Port Emission" },
        { value: "well_to_wake", label: "Well to Wake" },
        { value: "tank_to_wake", label: "Tank to Wake" },
        { value: "cargo_emission", label: "Cargo Emission" },
      ],
    },
    { name: "voyageRef", label: "Voyage Ref", type: "text" },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "vesselImo", label: "Vessel IMO", type: "text" },
    { name: "routeDescription", label: "Route Description", type: "textarea" },
    { name: "distanceNm", label: "Distance (NM)", type: "text" },
    { name: "fuelConsumedMt", label: "Fuel Consumed (MT)", type: "text" },
    { name: "fuelType", label: "Fuel Type", type: "text" },
    { name: "co2EmissionsMt", label: "CO2 Emissions (MT)", type: "text" },
    { name: "ch4EmissionsMt", label: "CH4 Emissions (MT)", type: "text" },
    { name: "n2oEmissionsMt", label: "N2O Emissions (MT)", type: "text" },
    { name: "co2eEmissionsMt", label: "CO2e Emissions (MT)", type: "text" },
    { name: "emissionIntensity", label: "Emission Intensity", type: "text" },
    { name: "cargoCarriedMt", label: "Cargo Carried (MT)", type: "text" },
    { name: "calculationMethod", label: "Calculation Method", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/sustainability-esg-reporting/carbon-footprints"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Carbon Footprint
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <SerForm
          entityType="Carbon Footprint"
          apiPath="/api/v1/sustainability-esg-reporting/carbon-footprints"
          fields={CARBON_FOOTPRINT_FIELDS}
          returnPath="/sustainability-esg-reporting/carbon-footprints"
        />
      </div>
    </div>
  );
}
