import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { csoInquiries } from "@/db/schema";
import { CsoForm } from "@/components/customer-service-operations/cso-form";
import type { FieldConfig } from "@/components/customer-service-operations/cso-form";
import { getCustomerOptions } from "@/lib/lookups";

export default async function EditInquiryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customer_service:edit")))
    redirect("/customer-service-operations");

  const customerOpts = await getCustomerOptions(session.tenantId);

  const INQUIRY_FIELDS: FieldConfig[] = [
    { name: "inquiryNumber", label: "Inquiry Number", type: "text", required: true },
    { name: "customerName", label: "Customer Name", type: "select", options: customerOpts, required: true },
    { name: "customerEmail", label: "Customer Email", type: "text" },
    { name: "customerPhone", label: "Customer Phone", type: "text" },
    { name: "subject", label: "Subject", type: "text", required: true },
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
  const { id } = await params;
  const record = await db
    .select()
    .from(csoInquiries)
    .where(
      and(
        eq(csoInquiries.id, id),
        eq(csoInquiries.tenantId, session.tenantId),
        isNull(csoInquiries.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    inquiryNumber: record.inquiryNumber,
    customerName: record.customerName,
    customerEmail: record.customerEmail ?? "",
    customerPhone: record.customerPhone ?? "",
    subject: record.subject,
    channel: record.channel,
    priority: record.priority,
    status: record.status,
    description: record.description ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/customer-service-operations/${id}`} className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Inquiry</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CsoForm
          entityType="Inquiry"
          apiPath={`/api/v1/customer-service-operations/inquiries/${id}`}
          fields={INQUIRY_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/customer-service-operations/${id}`}
        />
      </div>
    </div>
  );
}
