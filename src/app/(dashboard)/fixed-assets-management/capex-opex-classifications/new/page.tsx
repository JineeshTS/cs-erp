import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { FamForm } from "@/components/fixed-assets-management/fam-form";
import type { FieldConfig } from "@/components/fixed-assets-management/fam-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewCapexOpexClassificationPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "asset:create"))
  )
    redirect("/fixed-assets-management/capex-opex-classifications");

  const currencyOpts = await getCurrencyOptions();

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
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
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
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/fixed-assets-management/capex-opex-classifications"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New CapEx/OpEx Classification
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FamForm
          entityType="CapEx/OpEx Classification"
          apiPath="/api/v1/fixed-assets-management/capex-opex-classifications"
          fields={CLASSIFICATION_FIELDS}
          returnPath="/fixed-assets-management/capex-opex-classifications"
        />
      </div>
    </div>
  );
}
