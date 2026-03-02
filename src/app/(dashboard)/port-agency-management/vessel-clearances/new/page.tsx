import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { PamForm } from "@/components/port-agency-management/pam-form";
import type { FieldConfig } from "@/components/port-agency-management/pam-form";

const VESSEL_CLEARANCE_FIELDS: FieldConfig[] = [
  {
    name: "clearanceType",
    label: "Clearance Type",
    type: "select",
    required: true,
    options: [
      { value: "inward", label: "Inward" },
      { value: "outward", label: "Outward" },
      { value: "coastal", label: "Coastal" },
      { value: "transit", label: "Transit" },
    ],
  },
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  { name: "imoNumber", label: "IMO Number", type: "text" },
  { name: "portCallRef", label: "Port Call Ref", type: "text" },
  { name: "portName", label: "Port Name", type: "text", required: true },
  { name: "flagState", label: "Flag State", type: "text" },
  { name: "lastPort", label: "Last Port", type: "text" },
  { name: "nextPort", label: "Next Port", type: "text" },
  { name: "grossTonnage", label: "Gross Tonnage", type: "number" },
  { name: "netTonnage", label: "Net Tonnage", type: "number" },
  { name: "crewCount", label: "Crew Count", type: "number" },
  { name: "passengerCount", label: "Passenger Count", type: "number" },
  {
    name: "cargoDescription",
    label: "Cargo Description",
    type: "textarea",
  },
  {
    name: "healthDeclaration",
    label: "Health Declaration",
    type: "checkbox",
  },
  {
    name: "customsClearance",
    label: "Customs Clearance",
    type: "checkbox",
  },
  {
    name: "immigrationClearance",
    label: "Immigration Clearance",
    type: "checkbox",
  },
  {
    name: "portHealthClearance",
    label: "Port Health Clearance",
    type: "checkbox",
  },
  {
    name: "quarantineClearance",
    label: "Quarantine Clearance",
    type: "checkbox",
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewVesselClearancePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "port_agency:create"))
  )
    redirect("/port-agency-management/vessel-clearances");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/port-agency-management/vessel-clearances"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Vessel Clearance
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PamForm
          entityType="Vessel Clearance"
          apiPath="/api/v1/port-agency-management/vessel-clearances"
          fields={VESSEL_CLEARANCE_FIELDS}
          returnPath="/port-agency-management/vessel-clearances"
        />
      </div>
    </div>
  );
}
