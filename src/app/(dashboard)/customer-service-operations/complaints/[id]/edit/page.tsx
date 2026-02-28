import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { csoComplaints } from "@/db/schema";
import { CsoForm } from "@/components/customer-service-operations/cso-form";
import type { FieldConfig } from "@/components/customer-service-operations/cso-form";

const COMPLAINT_FIELDS: FieldConfig[] = [
  { name: "complaintNumber", label: "Complaint Number", type: "text", required: true },
  { name: "customerName", label: "Customer Name", type: "text", required: true },
  { name: "customerEmail", label: "Customer Email", type: "text" },
  { name: "customerPhone", label: "Customer Phone", type: "text" },
  { name: "subject", label: "Subject", type: "text", required: true },
  { name: "complaintType", label: "Complaint Type", type: "select", options: [
    { value: "service", label: "Service" },
    { value: "billing", label: "Billing" },
    { value: "cargo_damage", label: "Cargo Damage" },
    { value: "delay", label: "Delay" },
    { value: "documentation", label: "Documentation" },
    { value: "other", label: "Other" },
  ]},
  { name: "severity", label: "Severity", type: "select", options: [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ]},
  { name: "status", label: "Status", type: "select", options: [
    { value: "open", label: "Open" },
    { value: "investigating", label: "Investigating" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ]},
  { name: "rootCause", label: "Root Cause", type: "textarea" },
  { name: "correctionAction", label: "Correction Action", type: "textarea" },
  { name: "preventiveAction", label: "Preventive Action", type: "textarea" },
  { name: "description", label: "Description", type: "textarea" },
];

export default async function EditComplaintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customer_service:edit")))
    redirect("/customer-service-operations/complaints");

  const { id } = await params;
  const record = await db
    .select()
    .from(csoComplaints)
    .where(
      and(
        eq(csoComplaints.id, id),
        eq(csoComplaints.tenantId, session.tenantId),
        isNull(csoComplaints.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    complaintNumber: record.complaintNumber,
    customerName: record.customerName,
    customerEmail: record.customerEmail ?? "",
    customerPhone: record.customerPhone ?? "",
    subject: record.subject,
    complaintType: record.complaintType,
    severity: record.severity,
    status: record.status,
    rootCause: record.rootCause ?? "",
    correctionAction: record.correctionAction ?? "",
    preventiveAction: record.preventiveAction ?? "",
    description: record.description ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/customer-service-operations/complaints/${id}`} className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Complaint</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CsoForm
          entityType="Complaint"
          apiPath={`/api/v1/customer-service-operations/complaints/${id}`}
          fields={COMPLAINT_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/customer-service-operations/complaints/${id}`}
        />
      </div>
    </div>
  );
}
