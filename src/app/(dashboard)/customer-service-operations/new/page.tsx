import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CsoForm } from "@/components/customer-service-operations/cso-form";
import type { FieldConfig } from "@/components/customer-service-operations/cso-form";

const INQUIRY_FIELDS: FieldConfig[] = [
  { name: "inquiryNumber", label: "Inquiry Number", type: "text", required: true, placeholder: "INQ-001" },
  { name: "customerName", label: "Customer Name", type: "text", required: true, placeholder: "Acme Shipping Co." },
  { name: "customerEmail", label: "Customer Email", type: "text", placeholder: "contact@example.com" },
  { name: "customerPhone", label: "Customer Phone", type: "text", placeholder: "+974 1234 5678" },
  { name: "subject", label: "Subject", type: "text", required: true, placeholder: "Inquiry subject..." },
  { name: "channel", label: "Channel", type: "select", options: [
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "chat", label: "Chat" },
    { value: "portal", label: "Portal" },
    { value: "walk_in", label: "Walk-in" },
  ]},
  { name: "priority", label: "Priority", type: "select", options: [
    { value: "low", label: "Low" },
    { value: "normal", label: "Normal" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ]},
  { name: "status", label: "Status", type: "select", options: [
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "pending_customer", label: "Pending Customer" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ]},
  { name: "description", label: "Description", type: "textarea" },
];

export default async function NewInquiryPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customer_service:create")))
    redirect("/customer-service-operations");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customer-service-operations" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Inquiry</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CsoForm
          entityType="Inquiry"
          apiPath="/api/v1/customer-service-operations/inquiries"
          fields={INQUIRY_FIELDS}
          returnPath="/customer-service-operations"
        />
      </div>
    </div>
  );
}
