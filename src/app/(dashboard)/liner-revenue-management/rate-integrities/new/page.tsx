import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { LrmForm, type FieldConfig } from "@/components/liner-revenue-management/lrm-form";

const RATE_INTEGRITY_FIELDS: FieldConfig[] = [
  {
    name: "integrityType",
    label: "Integrity Type",
    type: "select",
    required: true,
    options: [
      { value: "rate_audit", label: "Rate Audit" },
      { value: "discount_review", label: "Discount Review" },
      { value: "tariff_compliance", label: "Tariff Compliance" },
      { value: "approval_check", label: "Approval Check" },
      { value: "deviation_alert", label: "Deviation Alert" },
    ],
  },
  { name: "tradeLane", label: "Trade Lane", type: "text" },
  { name: "customerName", label: "Customer Name", type: "text" },
  { name: "publishedRate", label: "Published Rate", type: "text" },
  { name: "appliedRate", label: "Applied Rate", type: "text" },
  { name: "discountPct", label: "Discount %", type: "text" },
  { name: "maxAllowedDiscount", label: "Max Allowed Discount", type: "text" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "authorized", label: "Authorized", type: "checkbox" },
  { name: "authorizedBy", label: "Authorized By", type: "text" },
  { name: "violationSeverity", label: "Violation Severity", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewRateIntegrityPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "lrm:create"))
  )
    redirect("/liner-revenue-management/rate-integrities");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/liner-revenue-management/rate-integrities"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Rate Integrity
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LrmForm
          entityType="Rate Integrity"
          apiPath="/api/v1/liner-revenue-management/rate-integrities"
          fields={RATE_INTEGRITY_FIELDS}
          returnPath="/liner-revenue-management/rate-integrities"
        />
      </div>
    </div>
  );
}
