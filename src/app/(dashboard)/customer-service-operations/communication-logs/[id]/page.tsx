import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { csoCommunicationLogs } from "@/db/schema";

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

export default async function CommunicationLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customer_service:read")))
    redirect("/customer-service-operations");

  const { id } = await params;

  const record = await db
    .select()
    .from(csoCommunicationLogs)
    .where(
      and(
        eq(csoCommunicationLogs.id, id),
        eq(csoCommunicationLogs.tenantId, session.tenantId),
        isNull(csoCommunicationLogs.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "customer_service:edit");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customer-service-operations/communication-logs" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Communication Log</h1>
          <p className="text-sm text-gray-500">{record.subject ?? "No subject"}</p>
        </div>
        {canEdit && (
          <Link
            href={`/customer-service-operations/communication-logs/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Direction", value: record.direction },
            { label: "Channel", value: record.channel },
            { label: "From", value: record.fromAddress ?? "-" },
            { label: "To", value: record.toAddress ?? "-" },
            { label: "Subject", value: record.subject ?? "-" },
            { label: "Sent At", value: fmtDate(record.sentAt) },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium text-gray-500">{field.label}</p>
              <p className="mt-0.5 text-sm text-gray-900">{field.value}</p>
            </div>
          ))}
        </div>
        {record.body && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-medium text-gray-500">Body</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.body}</p>
          </div>
        )}
      </div>
    </div>
  );
}
