import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  AnmForm,
  type FieldConfig,
} from "@/components/agent-network-management/anm-form";
import { getCustomerOptions } from "@/lib/lookups";

export default async function NewAgentCommissionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "anm:create")))
    redirect("/");

  const customerOpts = await getCustomerOptions(session.tenantId);

  const COMMISSION_FIELDS: FieldConfig[] = [
    {
      name: "commissionType",
      label: "Commission Type",
      type: "select",
      required: true,
      options: [
        { value: "freight_commission", label: "Freight Commission" },
        { value: "thc_commission", label: "THC Commission" },
        { value: "surcharge_commission", label: "Surcharge Commission" },
        { value: "bonus_commission", label: "Bonus Commission" },
        { value: "override_commission", label: "Override Commission" },
      ],
    },
    { name: "agentName", label: "Agent Name", type: "select", options: customerOpts },
    { name: "agentCode", label: "Agent Code", type: "text" },
    { name: "bookingRef", label: "Booking Ref", type: "text" },
    { name: "freightAmount", label: "Freight Amount", type: "text" },
    { name: "commissionRate", label: "Commission Rate", type: "text" },
    { name: "commissionAmount", label: "Commission Amount", type: "text" },
    { name: "commissionCurrency", label: "Commission Currency", type: "text" },
    { name: "periodFrom", label: "Period From", type: "datetime-local" },
    { name: "periodTo", label: "Period To", type: "datetime-local" },
    { name: "paymentDate", label: "Payment Date", type: "datetime-local" },
    { name: "paymentRef", label: "Payment Ref", type: "text" },
    { name: "invoiceNumber", label: "Invoice Number", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/agent-network-management/agent-commissions"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Agent Commission
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new agent commission record
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <AnmForm
          entityType="Agent Commission"
          apiPath="/api/v1/agent-network-management/agent-commissions"
          returnPath="/agent-network-management/agent-commissions"
          fields={COMMISSION_FIELDS}
        />
      </div>
    </div>
  );
}
