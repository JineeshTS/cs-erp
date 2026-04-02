import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { LtrForm } from "@/components/liner-trade-route-management/ltr-form";
import type { FieldConfig } from "@/components/liner-trade-route-management/ltr-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function NewSlotAgreementPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "liner:create")))
    redirect("/");

  const currencyOpts = await getCurrencyOptions();

  const fields: FieldConfig[] = [
    {
      name: "agreementType",
      label: "Agreement Type",
      type: "select",
      required: true,
      options: [
        { value: "vsa", label: "VSA" },
        { value: "slot_charter", label: "Slot Charter" },
        { value: "slot_purchase", label: "Slot Purchase" },
        { value: "slot_exchange", label: "Slot Exchange" },
      ],
    },
    { name: "partnerName", label: "Partner Name", type: "text", required: true },
    { name: "partnerCode", label: "Partner Code", type: "text" },
    { name: "serviceLoopName", label: "Service Loop Name", type: "text" },
    { name: "tradeRoute", label: "Trade Route", type: "text" },
    { name: "slotAllocationTeu", label: "Slot Allocation (TEU)", type: "number" },
    { name: "slotUtilizationPercent", label: "Slot Utilization %", type: "text" },
    { name: "revenueSharePercent", label: "Revenue Share %", type: "text" },
    { name: "costSharePercent", label: "Cost Share %", type: "text" },
    { name: "minimumQuantityCommitment", label: "Minimum Quantity Commitment", type: "number" },
    { name: "effectiveFrom", label: "Effective From", type: "datetime-local", required: true },
    { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
    {
      name: "settlementFrequency",
      label: "Settlement Frequency",
      type: "select",
      options: [
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" },
        { value: "quarterly", label: "Quarterly" },
      ],
    },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "approvedByName", label: "Approved By", type: "text" },
    { name: "penaltyClause", label: "Penalty Clause", type: "textarea" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/liner-trade-route-management/slot-agreements"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to Slot Agreements
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">
          New Slot Agreement
        </h1>
      </div>

      <LtrForm
        entityType="Slot Agreement"
        apiPath="/api/v1/liner-trade-route-management/slot-agreements"
        fields={fields}
        returnPath="/liner-trade-route-management/slot-agreements"
      />
    </div>
  );
}
