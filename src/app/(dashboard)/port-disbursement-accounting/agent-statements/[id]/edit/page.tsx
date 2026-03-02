import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getAgentStatement } from "@/lib/port-disbursement-accounting/service";
import {
  PdaForm,
  type FieldConfig,
} from "@/components/port-disbursement-accounting/pda-form";

const AGENT_STATEMENT_FIELDS: FieldConfig[] = [
  { name: "agentName", label: "Agent Name", type: "text", required: true },
  { name: "agentCode", label: "Agent Code", type: "text" },
  { name: "portCode", label: "Port Code", type: "text" },
  { name: "portName", label: "Port Name", type: "text" },
  {
    name: "statementDate",
    label: "Statement Date",
    type: "datetime-local",
    required: true,
  },
  { name: "periodFrom", label: "Period From", type: "datetime-local" },
  { name: "periodTo", label: "Period To", type: "datetime-local" },
  { name: "currency", label: "Currency", type: "text" },
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

export default async function EditAgentStatementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "disbursement:edit")))
    redirect("/port-disbursement-accounting/agent-statements");

  const { id } = await params;

  const record = await getAgentStatement(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/port-disbursement-accounting/agent-statements/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Agent Statement
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PdaForm
          entityType="Agent Statement"
          apiPath={`/api/v1/port-disbursement-accounting/agent-statements/${id}`}
          fields={AGENT_STATEMENT_FIELDS}
          initialData={{
            agentName: record.agentName ?? "",
            agentCode: record.agentCode ?? "",
            portCode: record.portCode ?? "",
            portName: record.portName ?? "",
            statementDate: record.statementDate
              ? new Date(record.statementDate).toISOString()
              : "",
            periodFrom: record.periodFrom
              ? new Date(record.periodFrom).toISOString()
              : "",
            periodTo: record.periodTo
              ? new Date(record.periodTo).toISOString()
              : "",
            currency: record.currency ?? "",
            openingBalance: record.openingBalance ?? "",
            totalDebits: record.totalDebits ?? "",
            totalCredits: record.totalCredits ?? "",
            closingBalance: record.closingBalance,
            transactionCount: record.transactionCount ?? "",
            advancePaid: record.advancePaid ?? "",
            balanceDue: record.balanceDue ?? "",
            dueDate: record.dueDate
              ? new Date(record.dueDate).toISOString()
              : "",
            notes: record.notes ?? "",
          }}
          isEdit
          returnPath={`/port-disbursement-accounting/agent-statements/${id}`}
        />
      </div>
    </div>
  );
}
