import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getRegulatoryAlert } from "@/lib/knowledge-management-training/service";
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

export default async function EditRegulatoryAlertPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "kmt:edit")))
    redirect("/knowledge-management-training/regulatory-alerts");

  const { id } = await params;

  const record = await getRegulatoryAlert(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/knowledge-management-training/regulatory-alerts/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Regulatory Alert
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <KmtForm
          entityType="Regulatory Alert"
          apiPath={`/api/v1/knowledge-management-training/regulatory-alerts/${id}`}
          fields={REGULATORY_ALERT_FIELDS}
          initialData={{
            alertType: record.alertType,
            title: record.title ?? "",
            regulatoryBody: record.regulatoryBody ?? "",
            jurisdiction: record.jurisdiction ?? "",
            effectiveDate: record.effectiveDate ? record.effectiveDate.toISOString().slice(0, 16) : "",
            impactLevel: record.impactLevel ?? "",
            affectedDepartments: record.affectedDepartments ?? "",
            complianceDeadline: record.complianceDeadline ? record.complianceDeadline.toISOString().slice(0, 16) : "",
            acknowledged: record.acknowledged ?? false,
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/knowledge-management-training/regulatory-alerts/${id}`}
        />
      </div>
    </div>
  );
}
