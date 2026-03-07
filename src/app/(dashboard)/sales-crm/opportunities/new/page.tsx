import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ScmForm } from "@/components/sales-crm/scm-form";
import type { FieldConfig } from "@/components/sales-crm/scm-form";
import { getPortOptions, getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewOpportunityPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:create")))
    redirect("/sales-crm");

  const [portOpts, customerOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const OPPORTUNITY_FIELDS: FieldConfig[] = [
    { name: "opportunityName", label: "Opportunity Name", type: "text", required: true },
    { name: "opportunityCode", label: "Opportunity Code", type: "text" },
    { name: "customerId", label: "Customer ID", type: "select", options: customerOpts, required: true },
    { name: "contactId", label: "Contact ID", type: "text" },
    { name: "stageId", label: "Stage ID", type: "text" },
    { name: "ownerId", label: "Owner ID", type: "text", required: true, placeholder: "UUID of the owner" },
    { name: "expectedRevenue", label: "Expected Revenue", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "probability", label: "Probability %", type: "number" },
    { name: "expectedTeu", label: "Expected TEU", type: "number" },
    { name: "tradeLane", label: "Trade Lane", type: "text" },
    { name: "originPort", label: "Origin Port", type: "select", options: portOpts },
    { name: "destinationPort", label: "Destination Port", type: "select", options: portOpts },
    { name: "serviceType", label: "Service Type", type: "select", options: [
      { value: "fcl", label: "FCL" },
      { value: "lcl", label: "LCL" },
      { value: "breakbulk", label: "Breakbulk" },
      { value: "reefer", label: "Reefer" },
      { value: "tanker", label: "Tanker" },
    ]},
    { name: "expectedCloseDate", label: "Expected Close Date", type: "date" },
    { name: "lostReason", label: "Lost Reason", type: "text" },
    { name: "competitorName", label: "Competitor Name", type: "text" },
    { name: "source", label: "Source", type: "text" },
    { name: "status", label: "Status", type: "select", options: [
      { value: "open", label: "Open" },
      { value: "won", label: "Won" },
      { value: "lost", label: "Lost" },
      { value: "on_hold", label: "On Hold" },
    ]},
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/sales-crm/opportunities"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Opportunity
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Opportunity"
          apiPath="/api/v1/sales-crm/opportunities"
          fields={OPPORTUNITY_FIELDS}
          returnPath="/sales-crm/opportunities"
        />
      </div>
    </div>
  );
}
