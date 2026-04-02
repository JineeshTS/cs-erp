import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CsoForm } from "@/components/customer-service-operations/cso-form";
import type { FieldConfig } from "@/components/customer-service-operations/cso-form";

const COMMUNICATION_LOG_FIELDS: FieldConfig[] = [
  { name: "entityType", label: "Entity Type", type: "select", required: true, options: [
    { value: "inquiry", label: "Inquiry" },
    { value: "complaint", label: "Complaint" },
    { value: "service_request", label: "Service Request" },
  ]},
  { name: "entityId", label: "Entity ID", type: "text", required: true, placeholder: "Related entity UUID" },
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
  { name: "fromAddress", label: "From", type: "text", placeholder: "sender@example.com" },
  { name: "toAddress", label: "To", type: "text", placeholder: "recipient@example.com" },
  { name: "subject", label: "Subject", type: "text", placeholder: "Communication subject..." },
  { name: "body", label: "Body", type: "textarea", placeholder: "Communication body..." },
  { name: "sentAt", label: "Sent At", type: "datetime-local" },
];

export default async function NewCommunicationLogPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customer_service:create")))
    redirect("/customer-service-operations/communication-logs");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customer-service-operations/communication-logs" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Communication Log</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CsoForm
          entityType="Communication Log"
          apiPath="/api/v1/customer-service-operations/communication-logs"
          fields={COMMUNICATION_LOG_FIELDS}
          returnPath="/customer-service-operations/communication-logs"
        />
      </div>
    </div>
  );
}
