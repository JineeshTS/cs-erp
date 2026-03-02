import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCrewChangeCoordination } from "@/lib/port-agency-management/service";
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

export default async function EditCrewChangeCoordinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "port_agency:edit")))
    redirect("/port-agency-management/crew-change-coordinations");

  const { id } = await params;

  const coord = await getCrewChangeCoordination(id, session.tenantId);
  if (!coord) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/port-agency-management/crew-change-coordinations/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Crew Change Coordination
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PamForm
          entityType="Crew Change Coordination"
          apiPath={`/api/v1/port-agency-management/crew-change-coordinations/${id}`}
          fields={CREW_CHANGE_COORDINATION_FIELDS}
          initialData={{
            coordinationType: coord.coordinationType,
            vesselName: coord.vesselName,
            imoNumber: coord.imoNumber ?? "",
            portCallRef: coord.portCallRef ?? "",
            portName: coord.portName ?? "",
            crewMemberName: coord.crewMemberName,
            crewRank: coord.crewRank ?? "",
            nationality: coord.nationality ?? "",
            passportNumber: coord.passportNumber ?? "",
            seamanBookNumber: coord.seamanBookNumber ?? "",
            visaRequired: coord.visaRequired ?? false,
            visaStatus: coord.visaStatus ?? "",
            hotelRequired: coord.hotelRequired ?? false,
            transportArranged: coord.transportArranged ?? false,
            transportDetails: coord.transportDetails ?? "",
            scheduledDate: coord.scheduledDate
              ? new Date(coord.scheduledDate).toISOString()
              : "",
            estimatedCost: coord.estimatedCost ?? "",
            actualCost: coord.actualCost ?? "",
            currency: coord.currency ?? "",
            notes: coord.notes ?? "",
          }}
          isEdit
          returnPath={`/port-agency-management/crew-change-coordinations/${id}`}
        />
      </div>
    </div>
  );
}
