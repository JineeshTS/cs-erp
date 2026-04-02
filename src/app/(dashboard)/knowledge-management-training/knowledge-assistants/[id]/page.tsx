import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getKnowledgeAssistant } from "@/lib/knowledge-management-training/service";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  draft: "secondary",
  in_progress: "warning",
  completed: "success",
  verified: "success",
  rejected: "destructive",
} as const;

export default async function KnowledgeAssistantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "kmt:read")))
    redirect("/knowledge-management-training");

  const { id } = await params;

  const record = await getKnowledgeAssistant(id, session.tenantId);
  if (!record) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "kmt:edit"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/knowledge-management-training/knowledge-assistants"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.assistantRef}
          </h1>
          <p className="text-sm text-gray-500">
            {record.assistantType?.replace(/_/g, " ")} &middot; Knowledge Assistant
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/knowledge-management-training/knowledge-assistants/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Assistant Ref</dt>
            <dd className="mt-1 text-gray-900">{record.assistantRef}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Assistant Type</dt>
            <dd className="mt-1 text-gray-900 capitalize">{record.assistantType?.replace(/_/g, " ")}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Query</dt>
            <dd className="mt-1 text-gray-900">{record.query || "-"}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Response</dt>
            <dd className="mt-1 text-gray-900">{record.response || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Source Docs</dt>
            <dd className="mt-1 text-gray-900">{record.sourceDocs || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Confidence Score</dt>
            <dd className="mt-1 text-gray-900">{record.confidenceScore ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Feedback Rating</dt>
            <dd className="mt-1 text-gray-900">{record.feedbackRating ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Model Version</dt>
            <dd className="mt-1 text-gray-900">{record.modelVersion || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Response Time (ms)</dt>
            <dd className="mt-1 text-gray-900">{record.responseTimeMs ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Helpful</dt>
            <dd className="mt-1 text-gray-900">{record.helpful ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  statusVariant[
                    record.status as keyof typeof statusVariant
                  ] ?? "secondary"
                }
              >
                {record.status}
              </Badge>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 text-gray-900">{record.notes || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {record.createdAt.toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {record.updatedAt.toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
