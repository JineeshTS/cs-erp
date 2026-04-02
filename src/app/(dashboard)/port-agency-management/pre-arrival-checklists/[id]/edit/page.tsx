import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getPreArrivalChecklist } from "@/lib/port-agency-management/service";
import { PamForm } from "@/components/port-agency-management/pam-form";
import type { FieldConfig } from "@/components/port-agency-management/pam-form";
import { getPortOptions, getVesselOptions } from "@/lib/lookups";

export default async function EditPreArrivalChecklistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "port_agency:edit")))
    redirect("/port-agency-management/pre-arrival-checklists");

  const [portOpts, vesselOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
  ]);

  const PRE_ARRIVAL_CHECKLIST_FIELDS: FieldConfig[] = [
    {
      name: "checklistType",
      label: "Checklist Type",
      type: "select",
      required: true,
      options: [
        { value: "standard", label: "Standard" },
        { value: "hazmat", label: "Hazmat" },
        { value: "tanker", label: "Tanker" },
        { value: "bulk", label: "Bulk" },
        { value: "passenger", label: "Passenger" },
        { value: "port_specific", label: "Port Specific" },
      ],
    },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "imoNumber", label: "IMO Number", type: "text" },
    { name: "portCallRef", label: "Port Call Ref", type: "text" },
    { name: "portName", label: "Port Name", type: "select", options: portOpts },
    { name: "arrivalDate", label: "Arrival Date", type: "datetime-local" },
    { name: "documentsDue", label: "Documents Due", type: "datetime-local" },
    { name: "totalCount", label: "Total Count", type: "number" },
    {
      name: "portAuthorityNotified",
      label: "Port Authority Notified",
      type: "checkbox",
    },
    { name: "customsNotified", label: "Customs Notified", type: "checkbox" },
    {
      name: "immigrationNotified",
      label: "Immigration Notified",
      type: "checkbox",
    },
    {
      name: "healthAuthorityNotified",
      label: "Health Authority Notified",
      type: "checkbox",
    },
    { name: "assignedTo", label: "Assigned To", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;

  const checklist = await getPreArrivalChecklist(id, session.tenantId);
  if (!checklist) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/port-agency-management/pre-arrival-checklists/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Pre-Arrival Checklist
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PamForm
          entityType="Pre-Arrival Checklist"
          apiPath={`/api/v1/port-agency-management/pre-arrival-checklists/${id}`}
          fields={PRE_ARRIVAL_CHECKLIST_FIELDS}
          initialData={{
            checklistType: checklist.checklistType,
            vesselName: checklist.vesselName,
            imoNumber: checklist.imoNumber ?? "",
            portCallRef: checklist.portCallRef ?? "",
            portName: checklist.portName ?? "",
            arrivalDate: checklist.arrivalDate
              ? new Date(checklist.arrivalDate).toISOString()
              : "",
            documentsDue: checklist.documentsDue
              ? new Date(checklist.documentsDue).toISOString()
              : "",
            totalCount: checklist.totalCount ?? "",
            portAuthorityNotified: checklist.portAuthorityNotified ?? false,
            customsNotified: checklist.customsNotified ?? false,
            immigrationNotified: checklist.immigrationNotified ?? false,
            healthAuthorityNotified: checklist.healthAuthorityNotified ?? false,
            assignedTo: checklist.assignedTo ?? "",
            notes: checklist.notes ?? "",
          }}
          isEdit
          returnPath={`/port-agency-management/pre-arrival-checklists/${id}`}
        />
      </div>
    </div>
  );
}
