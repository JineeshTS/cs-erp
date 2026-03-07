import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { csoServiceRequests } from "@/db/schema";
import { CsoForm } from "@/components/customer-service-operations/cso-form";
import type { FieldConfig } from "@/components/customer-service-operations/cso-form";
import { getCustomerOptions } from "@/lib/lookups";

export default async function EditServiceRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customer_service:edit")))
    redirect("/customer-service-operations/service-requests");

  const customerOpts = await getCustomerOptions(session.tenantId);

  const SERVICE_REQUEST_FIELDS: FieldConfig[] = [
    { name: "requestNumber", label: "Request Number", type: "text", required: true },
    { name: "customerName", label: "Customer Name", type: "select", options: customerOpts, required: true },
    { name: "requestType", label: "Request Type", type: "select", options: [
      { value: "general", label: "General" },
      { value: "booking_amendment", label: "Booking Amendment" },
      { value: "documentation", label: "Documentation" },
      { value: "billing", label: "Billing" },
      { value: "container_release", label: "Container Release" },
      { value: "tracking", label: "Tracking" },
      { value: "other", label: "Other" },
    ]},
    { name: "subject", label: "Subject", type: "text", required: true },
    { name: "priority", label: "Priority", type: "select", options: [
      { value: "low", label: "Low" },
      { value: "normal", label: "Normal" },
      { value: "high", label: "High" },
      { value: "urgent", label: "Urgent" },
    ]},
    { name: "status", label: "Status", type: "select", options: [
      { value: "open", label: "Open" },
      { value: "in_progress", label: "In Progress" },
      { value: "pending", label: "Pending" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ]},
    { name: "dueDate", label: "Due Date", type: "datetime-local" },
    { name: "estimatedHours", label: "Estimated Hours", type: "number" },
    { name: "description", label: "Description", type: "textarea" },
  ];
  const { id } = await params;
  const record = await db
    .select()
    .from(csoServiceRequests)
    .where(
      and(
        eq(csoServiceRequests.id, id),
        eq(csoServiceRequests.tenantId, session.tenantId),
        isNull(csoServiceRequests.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    requestNumber: record.requestNumber,
    customerName: record.customerName,
    requestType: record.requestType,
    subject: record.subject,
    priority: record.priority,
    status: record.status,
    dueDate: record.dueDate ? record.dueDate.toISOString() : "",
    estimatedHours: record.estimatedHours ?? "",
    description: record.description ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/customer-service-operations/service-requests/${id}`} className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Service Request</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CsoForm
          entityType="Service Request"
          apiPath={`/api/v1/customer-service-operations/service-requests/${id}`}
          fields={SERVICE_REQUEST_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/customer-service-operations/service-requests/${id}`}
        />
      </div>
    </div>
  );
}
