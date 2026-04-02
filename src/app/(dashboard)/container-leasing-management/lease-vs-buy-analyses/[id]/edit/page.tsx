import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getLeaseVsBuyAnalysis } from "@/lib/container-leasing-management/service";
import {
  ClmForm,
  type FieldConfig,
} from "@/components/container-leasing-management/clm-form";

const ANALYSIS_FIELDS: FieldConfig[] = [
  {
    name: "analysisType",
    label: "Analysis Type",
    type: "select",
    options: [
      { value: "npv_comparison", label: "NPV Comparison" },
      { value: "break_even", label: "Break Even" },
      { value: "sensitivity", label: "Sensitivity" },
      { value: "scenario", label: "Scenario" },
      { value: "portfolio", label: "Portfolio" },
    ],
  },
  { name: "containerType", label: "Container Type", type: "text" },
  { name: "containerSize", label: "Container Size", type: "text" },
  { name: "quantity", label: "Quantity", type: "number" },
  { name: "purchasePrice", label: "Purchase Price", type: "text" },
  { name: "leaseRate", label: "Lease Rate", type: "text" },
  { name: "leaseTerm", label: "Lease Term", type: "number" },
  { name: "discountRate", label: "Discount Rate", type: "text" },
  { name: "npvLease", label: "NPV Lease", type: "text" },
  { name: "npvBuy", label: "NPV Buy", type: "text" },
  { name: "breakEvenMonths", label: "Break Even Months", type: "number" },
  { name: "recommendation", label: "Recommendation", type: "text" },
  { name: "savingsAmount", label: "Savings Amount", type: "text" },
  { name: "analysisCurrency", label: "Analysis Currency", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditLeaseVsBuyAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "clm:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getLeaseVsBuyAnalysis(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/container-leasing-management/lease-vs-buy-analyses/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Lease vs Buy Analysis
          </h1>
          <p className="text-sm text-muted-foreground">
            Update lease vs buy analysis details
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <ClmForm
          entityType="Lease vs Buy Analysis"
          apiPath={`/api/v1/container-leasing-management/lease-vs-buy-analyses/${id}`}
          returnPath={`/container-leasing-management/lease-vs-buy-analyses/${id}`}
          fields={ANALYSIS_FIELDS}
          initialData={{
            analysisType: record.analysisType ?? "",
            containerType: record.containerType ?? "",
            containerSize: record.containerSize ?? "",
            quantity: record.quantity ?? "",
            purchasePrice: record.purchasePrice ?? "",
            leaseRate: record.leaseRate ?? "",
            leaseTerm: record.leaseTerm ?? "",
            discountRate: record.discountRate ?? "",
            npvLease: record.npvLease ?? "",
            npvBuy: record.npvBuy ?? "",
            breakEvenMonths: record.breakEvenMonths ?? "",
            recommendation: record.recommendation ?? "",
            savingsAmount: record.savingsAmount ?? "",
            analysisCurrency: record.analysisCurrency ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
        />
      </div>
    </div>
  );
}
