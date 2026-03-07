import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { CpmForm } from "@/components/commercial-pricing-management/cpm-form";
import type { FieldConfig } from "@/components/commercial-pricing-management/cpm-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewPricingApprovalPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const currencyOpts = await getCurrencyOptions();

  const fields: FieldConfig[] = [
    { name: "approvalReference", label: "Approval Reference", type: "text", required: true },
    {
      name: "approvalType",
      label: "Approval Type",
      type: "select",
      options: [
        { label: "Rate Deviation", value: "rate_deviation" },
        { label: "Special Rate", value: "special_rate" },
        { label: "Discount", value: "discount" },
        { label: "Waiver", value: "waiver" },
        { label: "Surcharge Exemption", value: "surcharge_exemption" },
      ],
    },
    {
      name: "entityType",
      label: "Entity Type",
      type: "select",
      options: [
        { label: "Tariff", value: "tariff" },
        { label: "Special Rate", value: "special_rate" },
        { label: "Surcharge", value: "surcharge" },
        { label: "Dead Freight", value: "dead_freight" },
        { label: "Quotation", value: "quotation" },
      ],
    },
    { name: "entityId", label: "Entity ID", type: "text", required: true },
    { name: "requestedBy", label: "Requested By", type: "text", required: true },
    { name: "currentLevel", label: "Current Level", type: "number" },
    { name: "maxLevel", label: "Max Level", type: "number" },
    { name: "deviationPercent", label: "Deviation Percent", type: "number" },
    { name: "originalAmount", label: "Original Amount", type: "number" },
    { name: "requestedAmount", label: "Requested Amount", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    {
      name: "urgency",
      label: "Urgency",
      type: "select",
      options: [
        { label: "Low", value: "low" },
        { label: "Normal", value: "normal" },
        { label: "High", value: "high" },
        { label: "Critical", value: "critical" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
        { label: "Escalated", value: "escalated" },
      ],
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  await hasPermission(session.id, session.tenantId, "commercial:read");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/commercial-pricing-management/pricing-approvals"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-semibold">New Pricing Approval</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CpmForm
          entityType="Pricing Approval"
          fields={fields}
          apiPath="/api/v1/commercial-pricing-management/pricing-approvals"
          returnPath="/commercial-pricing-management/pricing-approvals"
        />
      </div>
    </div>
  );
}
