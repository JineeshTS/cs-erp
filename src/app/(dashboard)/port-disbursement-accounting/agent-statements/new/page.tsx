import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import {
  PdaForm,
  type FieldConfig,
} from "@/components/port-disbursement-accounting/pda-form";
import { getPortOptions, getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewAgentStatementPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "disbursement:create"))
  )
    redirect("/port-disbursement-accounting/agent-statements");

  const [portOpts, customerOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const AGENT_STATEMENT_FIELDS: FieldConfig[] = [
    { name: "agentName", label: "Agent Name", type: "select", options: customerOpts, required: true },
    { name: "agentCode", label: "Agent Code", type: "text" },
    { name: "portCode", label: "Port Code", type: "select", options: portOpts },
    { name: "portName", label: "Port Name", type: "select", options: portOpts },
    {
      name: "statementDate",
      label: "Statement Date",
      type: "datetime-local",
      required: true,
    },
    { name: "periodFrom", label: "Period From", type: "datetime-local" },
    { name: "periodTo", label: "Period To", type: "datetime-local" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "openingBalance", label: "Opening Balance", type: "number" },
    { name: "totalDebits", label: "Total Debits", type: "number" },
    { name: "totalCredits", label: "Total Credits", type: "number" },
    {
      name: "closingBalance",
      label: "Closing Balance",
      type: "number",
      required: true,
    },
    { name: "transactionCount", label: "Transaction Count", type: "number" },
    { name: "advancePaid", label: "Advance Paid", type: "number" },
    { name: "balanceDue", label: "Balance Due", type: "number" },
    { name: "dueDate", label: "Due Date", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/port-disbursement-accounting/agent-statements"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Agent Statement
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PdaForm
          entityType="Agent Statement"
          apiPath="/api/v1/port-disbursement-accounting/agent-statements"
          fields={AGENT_STATEMENT_FIELDS}
          returnPath="/port-disbursement-accounting/agent-statements"
        />
      </div>
    </div>
  );
}
