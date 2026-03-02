import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPortAuthorityCommunication } from "@/lib/port-agency-management/service";
import { PamForm } from "@/components/port-agency-management/pam-form";
import type { FieldConfig } from "@/components/port-agency-management/pam-form";

const PORT_AUTHORITY_COMM_FIELDS: FieldConfig[] = [
  {
    name: "commType",
    label: "Communication Type",
    type: "select",
    required: true,
    options: [
      { value: "notice_arrival", label: "Notice of Arrival" },
      { value: "clearance_request", label: "Clearance Request" },
      { value: "berthing_request", label: "Berthing Request" },
      { value: "departure_notice", label: "Departure Notice" },
      { value: "safety_report", label: "Safety Report" },
      { value: "incident_report", label: "Incident Report" },
      { value: "general", label: "General" },
    ],
  },
  {
    name: "authorityName",
    label: "Authority Name",
    type: "text",
    required: true,
  },
  { name: "authorityDepartment", label: "Authority Department", type: "text" },
  { name: "contactPerson", label: "Contact Person", type: "text" },
  { name: "contactEmail", label: "Contact Email", type: "text" },
  { name: "contactPhone", label: "Contact Phone", type: "text" },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "imoNumber", label: "IMO Number", type: "text" },
  { name: "portCallRef", label: "Port Call Ref", type: "text" },
  { name: "portName", label: "Port Name", type: "text" },
  { name: "subject", label: "Subject", type: "text", required: true },
  { name: "messageBody", label: "Message Body", type: "textarea" },
  {
    name: "direction",
    label: "Direction",
    type: "select",
    options: [
      { value: "inbound", label: "Inbound" },
      { value: "outbound", label: "Outbound" },
    ],
  },
  {
    name: "priority",
    label: "Priority",
    type: "select",
    options: [
      { value: "low", label: "Low" },
      { value: "normal", label: "Normal" },
      { value: "high", label: "High" },
      { value: "urgent", label: "Urgent" },
    ],
  },
  {
    name: "responseRequired",
    label: "Response Required",
    type: "checkbox",
  },
  {
    name: "responseDeadline",
    label: "Response Deadline",
    type: "datetime-local",
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditPortAuthorityCommunicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "port_agency:edit")))
    redirect("/port-agency-management/port-authority-communications");

  const { id } = await params;

  const comm = await getPortAuthorityCommunication(id, session.tenantId);
  if (!comm) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/port-agency-management/port-authority-communications/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Port Authority Communication
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PamForm
          entityType="Port Authority Communication"
          apiPath={`/api/v1/port-agency-management/port-authority-communications/${id}`}
          fields={PORT_AUTHORITY_COMM_FIELDS}
          initialData={{
            commType: comm.commType,
            authorityName: comm.authorityName,
            authorityDepartment: comm.authorityDepartment ?? "",
            contactPerson: comm.contactPerson ?? "",
            contactEmail: comm.contactEmail ?? "",
            contactPhone: comm.contactPhone ?? "",
            vesselName: comm.vesselName ?? "",
            imoNumber: comm.imoNumber ?? "",
            portCallRef: comm.portCallRef ?? "",
            portName: comm.portName ?? "",
            subject: comm.subject,
            messageBody: comm.messageBody ?? "",
            direction: comm.direction ?? "",
            priority: comm.priority ?? "",
            responseRequired: comm.responseRequired ?? false,
            responseDeadline: comm.responseDeadline
              ? new Date(comm.responseDeadline).toISOString()
              : "",
            notes: comm.notes ?? "",
          }}
          isEdit
          returnPath={`/port-agency-management/port-authority-communications/${id}`}
        />
      </div>
    </div>
  );
}
