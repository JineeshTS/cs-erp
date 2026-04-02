import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getRateIntegrity } from "@/lib/liner-revenue-management/service";
import { LrmForm, type FieldConfig } from "@/components/liner-revenue-management/lrm-form";
import { getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditRateIntegrityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "lrm:edit")))
    redirect("/liner-revenue-management/rate-integrities");

  const [customerOpts, currencyOpts] = await Promise.all([
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

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
    { name: "customerName", label: "Customer Name", type: "select", options: customerOpts },
    { name: "publishedRate", label: "Published Rate", type: "text" },
    { name: "appliedRate", label: "Applied Rate", type: "text" },
    { name: "discountPct", label: "Discount %", type: "text" },
    { name: "maxAllowedDiscount", label: "Max Allowed Discount", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "authorized", label: "Authorized", type: "checkbox" },
    { name: "authorizedBy", label: "Authorized By", type: "text" },
    { name: "violationSeverity", label: "Violation Severity", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;

  const record = await getRateIntegrity(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/liner-revenue-management/rate-integrities/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Rate Integrity
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LrmForm
          entityType="Rate Integrity"
          apiPath={`/api/v1/liner-revenue-management/rate-integrities/${id}`}
          fields={RATE_INTEGRITY_FIELDS}
          initialData={{
            integrityType: record.integrityType,
            tradeLane: record.tradeLane ?? "",
            customerName: record.customerName ?? "",
            publishedRate: record.publishedRate ?? "",
            appliedRate: record.appliedRate ?? "",
            discountPct: record.discountPct ?? "",
            maxAllowedDiscount: record.maxAllowedDiscount ?? "",
            currency: record.currency ?? "",
            authorized: record.authorized ?? false,
            authorizedBy: record.authorizedBy ?? "",
            violationSeverity: record.violationSeverity ?? "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/liner-revenue-management/rate-integrities/${id}`}
        />
      </div>
    </div>
  );
}
