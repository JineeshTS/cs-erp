import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getCollectionWorkflow } from "@/lib/accounts-receivable-credit-control/service";
import { Badge } from "@/components/ui/badge";

export default async function CollectionWorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "receivable:read"))) redirect("/");
  const canEdit = await hasPermission(session.id, session.tenantId, "receivable:edit");

  const { id } = await params;
  const workflow = await getCollectionWorkflow(id, session.tenantId);
  if (!workflow) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/accounts-receivable-credit-control/collection-workflows" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{workflow.workflowRef}</h1>
            <p className="text-sm text-gray-500">{workflow.customerName}</p>
          </div>
        </div>
        {canEdit && (
          <Link href={`/accounts-receivable-credit-control/collection-workflows/${id}/edit`} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Workflow Details</h2>
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-gray-500">Workflow Ref</dt>
            <dd className="mt-1 text-sm text-gray-900">{workflow.workflowRef}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Customer Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{workflow.customerName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Account Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{workflow.accountNumber ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-sm text-gray-900">{workflow.currency ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Total Outstanding</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">{workflow.totalOutstanding?.toLocaleString() ?? "0"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Total Overdue</dt>
            <dd className="mt-1 text-sm font-semibold text-red-600">{workflow.totalOverdue?.toLocaleString() ?? "0"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Oldest Overdue Days</dt>
            <dd className="mt-1 text-sm text-gray-900">{workflow.oldestOverdueDays ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Invoice Count</dt>
            <dd className="mt-1 text-sm text-gray-900">{workflow.invoiceCount ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Escalation Level</dt>
            <dd className="mt-1 text-sm text-gray-900">{workflow.escalationLevel ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Escalation Type</dt>
            <dd className="mt-1 text-sm text-gray-900">{workflow.escalationType ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Assigned To</dt>
            <dd className="mt-1 text-sm text-gray-900">{workflow.assignedToName ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Last Contact Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{workflow.lastContactDate ? new Date(workflow.lastContactDate).toLocaleDateString() : "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Last Contact Method</dt>
            <dd className="mt-1 text-sm text-gray-900">{workflow.lastContactMethod ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Next Action Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{workflow.nextActionDate ? new Date(workflow.nextActionDate).toLocaleDateString() : "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Next Action Type</dt>
            <dd className="mt-1 text-sm text-gray-900">{workflow.nextActionType ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Promised Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{workflow.promisedDate ? new Date(workflow.promisedDate).toLocaleDateString() : "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Promised Amount</dt>
            <dd className="mt-1 text-sm text-gray-900">{workflow.promisedAmount?.toLocaleString() ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Collected Amount</dt>
            <dd className="mt-1 text-sm text-gray-900">{workflow.collectedAmount?.toLocaleString() ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Status</dt>
            <dd className="mt-1"><Badge variant={workflow.status === "active" ? "success" : workflow.status === "closed" ? "secondary" : "default"}>{workflow.status}</Badge></dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-900">{workflow.notes ?? "--"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
