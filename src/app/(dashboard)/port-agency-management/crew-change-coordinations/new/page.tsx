import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { PamForm } from "@/components/port-agency-management/pam-form";
import type { FieldConfig } from "@/components/port-agency-management/pam-form";

const CREW_CHANGE_COORDINATION_FIELDS: FieldConfig[] = [
  {
    name: "coordinationType",
    label: "Coordination Type",
    type: "select",
    required: true,
    options: [
      { value: "sign_on", label: "Sign On" },
      { value: "sign_off", label: "Sign Off" },
      { value: "relief", label: "Relief" },
      { value: "emergency", label: "Emergency" },
      { value: "medical_repatriation", label: "Medical Repatriation" },
    ],
  },
  { name: "vesselName", label: "Vessel Name", type: "text", required: true },
  { name: "imoNumber", label: "IMO Number", type: "text" },
  { name: "portCallRef", label: "Port Call Ref", type: "text" },
  { name: "portName", label: "Port Name", type: "text" },
  {
    name: "crewMemberName",
    label: "Crew Member Name",
    type: "text",
    required: true,
  },
  { name: "crewRank", label: "Crew Rank", type: "text" },
  { name: "nationality", label: "Nationality", type: "text" },
  { name: "passportNumber", label: "Passport Number", type: "text" },
  { name: "seamanBookNumber", label: "Seaman Book Number", type: "text" },
  { name: "visaRequired", label: "Visa Required", type: "checkbox" },
  {
    name: "visaStatus",
    label: "Visa Status",
    type: "select",
    options: [
      { value: "not_required", label: "Not Required" },
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
    ],
  },
  { name: "hotelRequired", label: "Hotel Required", type: "checkbox" },
  {
    name: "transportArranged",
    label: "Transport Arranged",
    type: "checkbox",
  },
  {
    name: "transportDetails",
    label: "Transport Details",
    type: "textarea",
  },
  { name: "scheduledDate", label: "Scheduled Date", type: "datetime-local" },
  { name: "estimatedCost", label: "Estimated Cost", type: "number" },
  { name: "actualCost", label: "Actual Cost", type: "number" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewCrewChangeCoordinationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "port_agency:create"))
  )
    redirect("/port-agency-management/crew-change-coordinations");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/port-agency-management/crew-change-coordinations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Crew Change Coordination
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PamForm
          entityType="Crew Change Coordination"
          apiPath="/api/v1/port-agency-management/crew-change-coordinations"
          fields={CREW_CHANGE_COORDINATION_FIELDS}
          returnPath="/port-agency-management/crew-change-coordinations"
        />
      </div>
    </div>
  );
}
