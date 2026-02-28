import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { csoCommunicationLogs } from "@/db/schema";
import { CsoForm } from "@/components/customer-service-operations/cso-form";
import type { FieldConfig } from "@/components/customer-service-operations/cso-form";

const COMMUNICATION_LOG_FIELDS: FieldConfig[] = [
  { name: "entityType", label: "Entity Type", type: "select", required: true, options: [
    { value: "inquiry", label: "Inquiry" },
    { value: "complaint", label: "Complaint" },
    { value: "service_request", label: "Service Request" },
  ]},
  { name: "entityId", label: "Entity ID", type: "text", required: true },
  { name: "direction", label: "Direction", type: "select", required: true, options: [
    { value: "inbound", label: "Inbound" },
    { value: "outbound", label: "Outbound" },
  ]},
  { name: "channel", label: "Channel", type: "select", required: true, options: [
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "chat", label: "Chat" },
    { value: "sms", label: "SMS" },
    { value: "portal", label: "Portal" },
  ]},
  { name: "fromAddress", label: "From", type: "text" },
  { name: "toAddress", label: "To", type: "text" },
  { name: "subject", label: "Subject", type: "text" },
  { name: "body", label: "Body", type: "textarea" },
  { name: "sentAt", label: "Sent At", type: "datetime-local" },
];

export default async function EditCommunicationLogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customer_service:edit")))
    redirect("/customer-service-operations/communication-logs");

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

  const initialData: Record<string, unknown> = {
    entityType: record.entityType,
    entityId: record.entityId,
    direction: record.direction,
    channel: record.channel,
    fromAddress: record.fromAddress ?? "",
    toAddress: record.toAddress ?? "",
    subject: record.subject ?? "",
    body: record.body ?? "",
    sentAt: record.sentAt?.toISOString() ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/customer-service-operations/communication-logs/${id}`} className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Communication Log</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CsoForm
          entityType="Communication Log"
          apiPath={`/api/v1/customer-service-operations/communication-logs/${id}`}
          fields={COMMUNICATION_LOG_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/customer-service-operations/communication-logs/${id}`}
        />
      </div>
    </div>
  );
}
