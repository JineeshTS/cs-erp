import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { BfmForm } from "@/components/bunker-fuel-management/bfm-form";
import type { FieldConfig } from "@/components/bunker-fuel-management/bfm-form";

const FUEL_ROB_FIELDS: FieldConfig[] = [
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  { name: "vesselImo", label: "Vessel IMO", type: "text" },
  { name: "voyageRef", label: "Voyage Ref", type: "text" },
  {
    name: "reportDate",
    label: "Report Date",
    type: "datetime-local",
    required: true,
  },
  {
    name: "fuelType",
    label: "Fuel Type",
    type: "select",
    required: true,
    options: [
      { value: "VLSFO", label: "VLSFO" },
      { value: "HSFO", label: "HSFO" },
      { value: "LSMGO", label: "LSMGO" },
      { value: "MGO", label: "MGO" },
      { value: "MDO", label: "MDO" },
      { value: "LNG", label: "LNG" },
      { value: "ULSFO", label: "ULSFO" },
      { value: "HFO", label: "HFO" },
      { value: "BIOFUEL", label: "BIOFUEL" },
    ],
  },
  {
    name: "robQuantity",
    label: "ROB Quantity",
    type: "number",
    required: true,
  },
  {
    name: "unit",
    label: "Unit",
    type: "select",
    options: [
      { value: "MT", label: "MT" },
      { value: "CBM", label: "CBM" },
      { value: "LTR", label: "LTR" },
      { value: "GAL", label: "GAL" },
    ],
  },
  { name: "consumptionDaily", label: "Daily Consumption", type: "number" },
  { name: "consumptionVoyage", label: "Voyage Consumption", type: "number" },
  { name: "receivedQuantity", label: "Received Quantity", type: "number" },
  {
    name: "transferredQuantity",
    label: "Transferred Quantity",
    type: "number",
  },
  { name: "location", label: "Location", type: "text" },
  { name: "portCode", label: "Port Code", type: "text" },
  {
    name: "reportType",
    label: "Report Type",
    type: "select",
    options: [
      { value: "noon", label: "Noon" },
      { value: "arrival", label: "Arrival" },
      { value: "departure", label: "Departure" },
      { value: "bunkering", label: "Bunkering" },
      { value: "end_of_sea_passage", label: "End of Sea Passage" },
      { value: "end_of_voyage", label: "End of Voyage" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewFuelRobPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "bunker:create")))
    redirect("/bunker-fuel-management/fuel-rob");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/bunker-fuel-management/fuel-rob"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Fuel ROB Record
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <BfmForm
          entityType="Fuel ROB Record"
          apiPath="/api/v1/bunker-fuel-management/fuel-rob"
          fields={FUEL_ROB_FIELDS}
          returnPath="/bunker-fuel-management/fuel-rob"
        />
      </div>
    </div>
  );
}
