import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CrmForm } from "@/components/crew-management/crm-form";
import type { FieldConfig } from "@/components/crew-management/crm-form";
import { getVesselOptions } from "@/lib/lookups";

export default async function NewCrewRotationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "crew:create")))
    redirect("/");

  const vesselOpts = await getVesselOptions(session.tenantId);

  const ROTATION_FIELDS: FieldConfig[] = [
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    {
      name: "crewMemberName",
      label: "Crew Member Name",
      type: "text",
      required: true,
    },
    { name: "rank", label: "Rank", type: "text", required: true },
    { name: "nationality", label: "Nationality", type: "text" },
    {
      name: "joiningDate",
      label: "Joining Date",
      type: "datetime-local",
      required: true,
    },
    { name: "relievingDate", label: "Relieving Date", type: "datetime-local" },
    {
      name: "contractDuration",
      label: "Contract Duration (months)",
      type: "number",
    },
    {
      name: "rotationType",
      label: "Rotation Type",
      type: "select",
      required: true,
      options: [
        { value: "joining", label: "Joining" },
        { value: "relieving", label: "Relieving" },
        { value: "extension", label: "Extension" },
        { value: "transfer", label: "Transfer" },
      ],
    },
    { name: "relievingCrewName", label: "Relieving Crew Name", type: "text" },
    { name: "reliefPort", label: "Relief Port", type: "text" },
    { name: "reliefCountry", label: "Relief Country", type: "text" },
    { name: "approvedByName", label: "Approved By Name", type: "text" },
    { name: "handoverNotes", label: "Handover Notes", type: "textarea" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/crew-management/crew-rotations"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Crew Rotation
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CrmForm
          entityType="Crew Rotation"
          apiPath="/api/v1/crew-management/crew-rotations"
          fields={ROTATION_FIELDS}
          returnPath="/crew-management/crew-rotations"
        />
      </div>
    </div>
  );
}
