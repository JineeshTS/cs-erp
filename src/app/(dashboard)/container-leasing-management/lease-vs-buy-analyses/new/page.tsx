import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
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

export default async function NewLeaseVsBuyAnalysisPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "clm:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/container-leasing-management/lease-vs-buy-analyses"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Lease vs Buy Analysis
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new lease vs buy financial analysis
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <ClmForm
          entityType="Lease vs Buy Analysis"
          apiPath="/api/v1/container-leasing-management/lease-vs-buy-analyses"
          returnPath="/container-leasing-management/lease-vs-buy-analyses"
          fields={ANALYSIS_FIELDS}
        />
      </div>
    </div>
  );
}
