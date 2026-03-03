import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCapexOpexClassification } from "@/lib/fixed-assets-management/service";
import { FamForm } from "@/components/fixed-assets-management/fam-form";
import type { FieldConfig } from "@/components/fixed-assets-management/fam-form";

const CLASSIFICATION_FIELDS: FieldConfig[] = [
  {
    name: "classificationType",
    label: "Classification Type",
    type: "select",
    required: true,
    options: [
      { value: "capex", label: "CapEx" },
      { value: "opex", label: "OpEx" },
      { value: "mixed", label: "Mixed" },
      { value: "reclassification", label: "Reclassification" },
    ],
  },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "expenditureDate", label: "Expenditure Date", type: "datetime-local" },
  { name: "amount", label: "Amount", type: "text" },
  { name: "currency", label: "Currency", type: "text", placeholder: "QAR" },
  { name: "assetRef", label: "Asset Ref", type: "text" },
  { name: "assetName", label: "Asset Name", type: "text" },
  { name: "costCenter", label: "Cost Center", type: "text" },
  { name: "glAccountCode", label: "GL Account Code", type: "text" },
  { name: "justification", label: "Justification", type: "textarea" },
  { name: "capitalizationThreshold", label: "Capitalization Threshold", type: "text" },
  { name: "usefulLifeExtension", label: "Useful Life Extension", type: "number" },
  { name: "improvementValue", label: "Improvement Value", type: "text" },
  { name: "classifiedBy", label: "Classified By", type: "text" },
  { name: "approvedBy", label: "Approved By", type: "text" },
  { name: "approvalDate", label: "Approval Date", type: "datetime-local" },
  { name: "journalEntryRef", label: "Journal Entry Ref", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditCapexOpexClassificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "asset:edit")))
    redirect("/fixed-assets-management/capex-opex-classifications");

  const { id } = await params;

  const record = await getCapexOpexClassification(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/fixed-assets-management/capex-opex-classifications/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit CapEx/OpEx Classification
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FamForm
          entityType="CapEx/OpEx Classification"
          apiPath={`/api/v1/fixed-assets-management/capex-opex-classifications/${id}`}
          fields={CLASSIFICATION_FIELDS}
          initialData={{
            classificationType: record.classificationType,
            title: record.title,
            expenditureDate: record.expenditureDate
              ? new Date(record.expenditureDate).toISOString()
              : "",
            amount: record.amount ?? "",
            currency: record.currency ?? "",
            assetRef: record.assetRef ?? "",
            assetName: record.assetName ?? "",
            costCenter: record.costCenter ?? "",
            glAccountCode: record.glAccountCode ?? "",
            justification: record.justification ?? "",
            capitalizationThreshold: record.capitalizationThreshold ?? "",
            usefulLifeExtension: record.usefulLifeExtension ?? "",
            improvementValue: record.improvementValue ?? "",
            classifiedBy: record.classifiedBy ?? "",
            approvedBy: record.approvedBy ?? "",
            approvalDate: record.approvalDate
              ? new Date(record.approvalDate).toISOString()
              : "",
            journalEntryRef: record.journalEntryRef ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/fixed-assets-management/capex-opex-classifications/${id}`}
        />
      </div>
    </div>
  );
}
