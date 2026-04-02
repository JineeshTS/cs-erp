import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { KmtForm, type FieldConfig } from "@/components/knowledge-management-training/kmt-form";

const REGULATORY_ALERT_FIELDS: FieldConfig[] = [
  {
    name: "alertType",
    label: "Alert Type",
    type: "select",
    required: true,
    options: [
      { value: "imo_update", label: "IMO Update" },
      { value: "customs_change", label: "Customs Change" },
      { value: "safety_regulation", label: "Safety Regulation" },
      { value: "environmental_rule", label: "Environmental Rule" },
      { value: "trade_compliance", label: "Trade Compliance" },
    ],
  },
  { name: "title", label: "Title", type: "text" },
  { name: "regulatoryBody", label: "Regulatory Body", type: "text" },
  { name: "jurisdiction", label: "Jurisdiction", type: "text" },
  { name: "effectiveDate", label: "Effective Date", type: "datetime-local" },
  { name: "impactLevel", label: "Impact Level", type: "text" },
  { name: "affectedDepartments", label: "Affected Departments", type: "text" },
  { name: "complianceDeadline", label: "Compliance Deadline", type: "datetime-local" },
  { name: "acknowledged", label: "Acknowledged", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewRegulatoryAlertPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "kmt:create"))
  )
    redirect("/knowledge-management-training/regulatory-alerts");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/knowledge-management-training/regulatory-alerts"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Regulatory Alert
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <KmtForm
          entityType="Regulatory Alert"
          apiPath="/api/v1/knowledge-management-training/regulatory-alerts"
          fields={REGULATORY_ALERT_FIELDS}
          returnPath="/knowledge-management-training/regulatory-alerts"
        />
      </div>
    </div>
  );
}
