import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { DgmForm } from "@/components/dangerous-goods-management/dgm-form";
import type { FieldConfig } from "@/components/dangerous-goods-management/dgm-form";

const PROCEDURE_FIELDS: FieldConfig[] = [
  { name: "procedureName", label: "Procedure Name", type: "text", required: true },
  {
    name: "procedureType",
    label: "Procedure Type",
    type: "select",
    required: true,
    options: [
      { value: "fire", label: "Fire" },
      { value: "spillage", label: "Spillage" },
      { value: "exposure", label: "Exposure" },
      { value: "general", label: "General" },
      { value: "evacuation", label: "Evacuation" },
      { value: "decontamination", label: "Decontamination" },
    ],
  },
  { name: "emsNumber", label: "EMS Number", type: "text" },
  { name: "mfagTableNumber", label: "MFAG Table Number", type: "text" },
  { name: "fireResponse", label: "Fire Response", type: "textarea" },
  { name: "spillageResponse", label: "Spillage Response", type: "textarea" },
  { name: "firstAidMeasures", label: "First Aid Measures", type: "textarea" },
  { name: "personalProtection", label: "Personal Protection", type: "textarea" },
  { name: "evacuationProcedure", label: "Evacuation Procedure", type: "textarea" },
  { name: "decontamination", label: "Decontamination", type: "textarea" },
  { name: "trainingRequirements", label: "Training Requirements", type: "textarea" },
  { name: "drillFrequency", label: "Drill Frequency", type: "text", placeholder: "e.g. Monthly, Quarterly" },
  { name: "lastDrillDate", label: "Last Drill Date", type: "datetime-local" },
  { name: "nextDrillDate", label: "Next Drill Date", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewEmergencyProcedurePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "dangerous_goods:create"))
  )
    redirect("/dangerous-goods-management/emergency-procedures");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dangerous-goods-management/emergency-procedures"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Emergency Procedure</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DgmForm
          entityType="Emergency Procedure"
          apiPath="/api/v1/dangerous-goods-management/emergency-procedures"
          fields={PROCEDURE_FIELDS}
          returnPath="/dangerous-goods-management/emergency-procedures"
        />
      </div>
    </div>
  );
}
