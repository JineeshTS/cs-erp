import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getImpairmentTest } from "@/lib/fixed-assets-management/service";
import { FamForm } from "@/components/fixed-assets-management/fam-form";
import type { FieldConfig } from "@/components/fixed-assets-management/fam-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditImpairmentTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "asset:edit")))
    redirect("/fixed-assets-management/impairment-tests");

  const currencyOpts = await getCurrencyOptions();

  const IMPAIRMENT_TEST_FIELDS: FieldConfig[] = [
    {
      name: "testType",
      label: "Test Type",
      type: "select",
      required: true,
      options: [
        { value: "annual", label: "Annual" },
        { value: "triggered", label: "Triggered" },
        { value: "interim", label: "Interim" },
        { value: "goodwill", label: "Goodwill" },
        { value: "cgu", label: "CGU" },
      ],
    },
    { name: "assetRef", label: "Asset Ref", type: "text" },
    { name: "assetName", label: "Asset Name", type: "text" },
    { name: "testDate", label: "Test Date", type: "datetime-local" },
    { name: "carryingAmount", label: "Carrying Amount", type: "text" },
    { name: "recoverableAmount", label: "Recoverable Amount", type: "text" },
    { name: "fairValueLessCosts", label: "Fair Value Less Costs", type: "text" },
    { name: "valueInUse", label: "Value In Use", type: "text" },
    { name: "impairmentLoss", label: "Impairment Loss", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "discountRate", label: "Discount Rate", type: "text" },
    { name: "reversalAmount", label: "Reversal Amount", type: "text" },
    { name: "testedBy", label: "Tested By", type: "text" },
    { name: "reviewedBy", label: "Reviewed By", type: "text" },
    { name: "journalEntryRef", label: "Journal Entry Ref", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  const { id } = await params;

  const record = await getImpairmentTest(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/fixed-assets-management/impairment-tests/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Impairment Test
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FamForm
          entityType="Impairment Test"
          apiPath={`/api/v1/fixed-assets-management/impairment-tests/${id}`}
          fields={IMPAIRMENT_TEST_FIELDS}
          initialData={{
            testType: record.testType,
            assetRef: record.assetRef ?? "",
            assetName: record.assetName ?? "",
            testDate: record.testDate
              ? new Date(record.testDate).toISOString()
              : "",
            carryingAmount: record.carryingAmount ?? "",
            recoverableAmount: record.recoverableAmount ?? "",
            fairValueLessCosts: record.fairValueLessCosts ?? "",
            valueInUse: record.valueInUse ?? "",
            impairmentLoss: record.impairmentLoss ?? "",
            currency: record.currency ?? "",
            discountRate: record.discountRate ?? "",
            reversalAmount: record.reversalAmount ?? "",
            testedBy: record.testedBy ?? "",
            reviewedBy: record.reviewedBy ?? "",
            journalEntryRef: record.journalEntryRef ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/fixed-assets-management/impairment-tests/${id}`}
        />
      </div>
    </div>
  );
}
