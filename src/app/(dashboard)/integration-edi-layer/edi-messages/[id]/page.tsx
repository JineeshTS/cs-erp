import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { ielEdiMessages } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

const statusVariant = (status: string) => {
  switch (status) {
    case "parsed":
    case "generated":
      return "success" as const;
    case "failed":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
};

const directionVariant = (direction: string) => {
  switch (direction) {
    case "outbound":
      return "secondary" as const;
    default:
      return "default" as const;
  }
};

function formatTimestamp(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function EdiMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "integration:read")))
    redirect("/");

  const { id } = await params;

  const message = await db
    .select()
    .from(ielEdiMessages)
    .where(
      and(
        eq(ielEdiMessages.id, id),
        eq(ielEdiMessages.tenantId, session.tenantId),
        isNull(ielEdiMessages.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!message) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/integration-edi-layer/edi-messages"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {message.messageRef}
          </h1>
          <p className="text-sm text-gray-500">EDI message details</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Message Ref</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {message.messageRef}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Message Type</dt>
            <dd className="mt-1 text-gray-900">{message.messageType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">EDI Standard</dt>
            <dd className="mt-1 text-gray-900">{message.ediStandard}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Direction</dt>
            <dd className="mt-1">
              <Badge variant={directionVariant(message.direction)}>
                {message.direction}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sender Code</dt>
            <dd className="mt-1 text-gray-900">{message.senderCode}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Receiver Code
            </dt>
            <dd className="mt-1 text-gray-900">{message.receiverCode}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge variant={statusVariant(message.status)}>
                {message.status}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Connection ID
            </dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {message.connectionId || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Related Entity Type
            </dt>
            <dd className="mt-1 text-gray-900">
              {message.relatedEntityType || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Related Entity ID
            </dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {message.relatedEntityId || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-900">
              {message.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Timestamps
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-gray-900">
              {formatTimestamp(message.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-gray-900">
              {formatTimestamp(message.updatedAt)}
            </dd>
          </div>
          {message.processedAt && (
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Processed At
              </dt>
              <dd className="mt-1 text-gray-900">
                {formatTimestamp(message.processedAt)}
              </dd>
            </div>
          )}
          {message.acknowledgedAt && (
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Acknowledged At
              </dt>
              <dd className="mt-1 text-gray-900">
                {formatTimestamp(message.acknowledgedAt)}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {message.rawContent != null && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Raw Content
          </h2>
          <pre className="overflow-x-auto rounded-md bg-gray-50 p-4 text-sm text-gray-800">
            {message.rawContent}
          </pre>
        </div>
      )}

      {message.parsedContent != null && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Parsed Content
          </h2>
          <pre className="overflow-x-auto rounded-md bg-gray-50 p-4 text-sm text-gray-800">
            {JSON.stringify(message.parsedContent, null, 2)}
          </pre>
        </div>
      )}

      {message.validationErrors != null && (
        <div className="rounded-lg border border-red-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-red-800">
            Validation Errors
          </h2>
          <pre className="overflow-x-auto rounded-md bg-red-50 p-4 text-sm text-red-700">
            {JSON.stringify(message.validationErrors, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
