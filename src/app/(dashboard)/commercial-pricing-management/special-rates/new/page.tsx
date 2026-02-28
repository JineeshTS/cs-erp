import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { CpmForm } from "@/components/commercial-pricing-management/cpm-form";
import type { FieldConfig } from "@/components/commercial-pricing-management/cpm-form";

const fields: FieldConfig[] = [
  { name: "rateCode", label: "Rate Code", type: "text", required: true },
  { name: "rateName", label: "Rate Name", type: "text", required: true },
  {
    name: "rateType",
    label: "Rate Type",
    type: "select",
    options: [
      { label: "Contract", value: "contract" },
      { label: "Spot", value: "spot" },
      { label: "Promotional", value: "promotional" },
      { label: "Loyalty", value: "loyalty" },
    ],
  },
  { name: "customerId", label: "Customer ID", type: "text" },
  { name: "customerSegment", label: "Customer Segment", type: "text" },
  { name: "originPort", label: "Origin Port", type: "text" },
  { name: "destinationPort", label: "Destination Port", type: "text" },
  { name: "tradeLane", label: "Trade Lane", type: "text" },
  { name: "containerType", label: "Container Type", type: "text" },
  { name: "containerSize", label: "Container Size", type: "text" },
  { name: "baseRate", label: "Base Rate", type: "number", required: true },
  { name: "discountPercent", label: "Discount %", type: "number" },
  { name: "finalRate", label: "Final Rate", type: "number", required: true },
  { name: "currency", label: "Currency", type: "text", placeholder: "e.g. USD" },
  { name: "minimumCommitmentTeu", label: "Min Commitment (TEU)", type: "number" },
  { name: "effectiveFrom", label: "Effective From", type: "datetime-local", required: true },
  { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Draft", value: "draft" },
      { label: "Active", value: "active" },
      { label: "Expired", value: "expired" },
      { label: "Suspended", value: "suspended" },
    ],
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewSpecialRatePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  await hasPermission(session.id, session.tenantId, "commercial:read");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/commercial-pricing-management/special-rates"
          className="rounded-md p-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">New Special Rate</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CpmForm
          entityType="Special Rate"
          fields={fields}
          apiPath="/api/v1/commercial-pricing-management/special-rates"
          returnPath="/commercial-pricing-management/special-rates"
        />
      </div>
    </div>
  );
}
