import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { FamForm } from "@/components/fixed-assets-management/fam-form";
import type { FieldConfig } from "@/components/fixed-assets-management/fam-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewLeaseAccountingPage(): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "asset:create"))
  )
    redirect("/fixed-assets-management/lease-accounting");

  const currencyOpts = await getCurrencyOptions();

  const LEASE_ACCOUNTING_FIELDS: FieldConfig[] = [
    {
      name: "leaseType",
      label: "Lease Type",
      type: "select",
      required: true,
      options: [
        { value: "finance_lease", label: "Finance Lease" },
        { value: "operating_lease", label: "Operating Lease" },
        { value: "short_term", label: "Short Term" },
        { value: "low_value", label: "Low Value" },
        { value: "sublease", label: "Sublease" },
      ],
    },
    { name: "assetRef", label: "Asset Ref", type: "text" },
    { name: "assetName", label: "Asset Name", type: "text" },
    { name: "lessorName", label: "Lessor Name", type: "text" },
    { name: "leaseStartDate", label: "Lease Start Date", type: "datetime-local" },
    { name: "leaseEndDate", label: "Lease End Date", type: "datetime-local" },
    { name: "leaseTermMonths", label: "Lease Term (Months)", type: "number" },
    { name: "monthlyPayment", label: "Monthly Payment", type: "text" },
    { name: "annualPayment", label: "Annual Payment", type: "text" },
    { name: "totalLeasePayments", label: "Total Lease Payments", type: "text" },
    { name: "discountRate", label: "Discount Rate", type: "text" },
    { name: "rouAssetValue", label: "ROU Asset Value", type: "text" },
    { name: "leaseLiability", label: "Lease Liability", type: "text" },
    { name: "accumulatedDepreciation", label: "Accumulated Depreciation", type: "text" },
    { name: "interestExpense", label: "Interest Expense", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "renewalOption", label: "Renewal Option", type: "checkbox" },
    { name: "purchaseOption", label: "Purchase Option", type: "checkbox" },
    { name: "terminationOption", label: "Termination Option", type: "checkbox" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/fixed-assets-management/lease-accounting"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Lease
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <FamForm
          entityType="Lease Account"
          apiPath="/api/v1/fixed-assets-management/lease-accounting"
          fields={LEASE_ACCOUNTING_FIELDS}
          returnPath="/fixed-assets-management/lease-accounting"
        />
      </div>
    </div>
  );
}
