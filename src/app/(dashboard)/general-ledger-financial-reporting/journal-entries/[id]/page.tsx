import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getJournalEntry } from "@/lib/general-ledger-financial-reporting/service";
import { Badge } from "@/components/ui/badge";

export default async function JournalEntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactNode> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "gl:read")))
    redirect("/");

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "gl:edit"
  );

  const { id } = await params;
  const record = await getJournalEntry(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/general-ledger-financial-reporting/journal-entries"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {record.entryRef}
            </h1>
            <p className="text-sm text-gray-500">
              {record.entryType} &middot;{" "}
              {record.entryDate
                ? new Date(record.entryDate).toLocaleDateString()
                : "No date"}
            </p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/general-ledger-financial-reporting/journal-entries/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Entry Details
          </h2>
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-gray-500">Entry Ref</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.entryRef}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Entry Type</dt>
            <dd className="mt-1 text-sm text-gray-900">{record.entryType}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Entry Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.entryDate
                ? new Date(record.entryDate).toLocaleDateString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Posting Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.postingDate
                ? new Date(record.postingDate).toLocaleDateString()
                : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Period ID</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.periodId ?? "--"}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.description ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Currency</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.currency ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Total Debit</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.totalDebit ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Total Credit</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.totalCredit ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Source Module
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.sourceModule ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Source Document Ref
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.sourceDocumentRef ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Reversal Entry ID
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.reversalEntryId ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">
              Is Auto Generated
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.isAutoGenerated ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Prepared By</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.preparedBy ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Reviewed By</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.reviewedBy ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Approved By</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {record.approvedBy ?? "--"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  record.status === "posted"
                    ? "success"
                    : record.status === "draft"
                      ? "secondary"
                      : "default"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
              {record.notes ?? "--"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
