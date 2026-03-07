import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getInsuranceValuation } from "@/lib/fixed-assets-management/service";
import { FamForm } from "@/components/fixed-assets-management/fam-form";
import type { FieldConfig } from "@/components/fixed-assets-management/fam-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditInsuranceValuationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "asset:edit")))
    redirect("/fixed-assets-management/insurance-valuations");

  const currencyOpts = await getCurrencyOptions();

  const VALUATION_FIELDS: FieldConfig[] = [
    {
      name: "recordType",
      label: "Record Type",
      type: "select",
      required: true,
      options: [
        { value: "insurance_policy", label: "Insurance Policy" },
        { value: "revaluation", label: "Revaluation" },
        { value: "appraisal", label: "Appraisal" },
        { value: "market_value", label: "Market Value" },
        { value: "replacement_cost", label: "Replacement Cost" },
      ],
    },
    { name: "assetRef", label: "Asset Ref", type: "text" },
    { name: "assetName", label: "Asset Name", type: "text" },
    { name: "insurer", label: "Insurer", type: "text" },
    { name: "policyNumber", label: "Policy Number", type: "text" },
    { name: "coverageType", label: "Coverage Type", type: "text" },
    { name: "coverageAmount", label: "Coverage Amount", type: "text" },
    { name: "premiumAmount", label: "Premium Amount", type: "text" },
    { name: "deductible", label: "Deductible", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    {
      name: "policyStartDate",
      label: "Policy Start Date",
      type: "datetime-local",
    },
    { name: "policyEndDate", label: "Policy End Date", type: "datetime-local" },
    { name: "valuationDate", label: "Valuation Date", type: "datetime-local" },
    { name: "valuationAmount", label: "Valuation Amount", type: "text" },
    { name: "valuedBy", label: "Valued By", type: "text" },
    { name: "valuationMethod", label: "Valuation Method", type: "text" },
    {
      name: "nextReviewDate",
      label: "Next Review Date",
      type: "datetime-local",
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;

  const record = await getInsuranceValuation(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    recordType: record.recordType ?? "",
    assetRef: record.assetRef ?? "",
    assetName: record.assetName ?? "",
    insurer: record.insurer ?? "",
    policyNumber: record.policyNumber ?? "",
    coverageType: record.coverageType ?? "",
    coverageAmount: record.coverageAmount ?? "",
    premiumAmount: record.premiumAmount ?? "",
    deductible: record.deductible ?? "",
    currency: record.currency ?? "",
    policyStartDate: record.policyStartDate
      ? new Date(record.policyStartDate).toISOString()
      : "",
    policyEndDate: record.policyEndDate
      ? new Date(record.policyEndDate).toISOString()
      : "",
    valuationDate: record.valuationDate
      ? new Date(record.valuationDate).toISOString()
      : "",
    valuationAmount: record.valuationAmount ?? "",
    valuedBy: record.valuedBy ?? "",
    valuationMethod: record.valuationMethod ?? "",
    nextReviewDate: record.nextReviewDate
      ? new Date(record.nextReviewDate).toISOString()
      : "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/fixed-assets-management/insurance-valuations/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Insurance / Valuation Record
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FamForm
          entityType="Insurance / Valuation"
          apiPath={`/api/v1/fixed-assets-management/insurance-valuations/${id}`}
          fields={VALUATION_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/fixed-assets-management/insurance-valuations/${id}`}
        />
      </div>
    </div>
  );
}
