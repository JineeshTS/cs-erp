import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CsoForm } from "@/components/customer-service-operations/cso-form";
import type { FieldConfig } from "@/components/customer-service-operations/cso-form";
import { getCustomerOptions } from "@/lib/lookups";

export default async function NewComplaintPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customer_service:create")))
    redirect("/customer-service-operations/complaints");

  const customerOpts = await getCustomerOptions(session.tenantId);

  const COMPLAINT_FIELDS: FieldConfig[] = [
    { name: "complaintNumber", label: "Complaint Number", type: "text", required: true, placeholder: "CMP-001" },
    { name: "customerName", label: "Customer Name", type: "select", options: customerOpts, required: true },
    { name: "customerEmail", label: "Customer Email", type: "text", placeholder: "contact@example.com" },
    { name: "customerPhone", label: "Customer Phone", type: "text", placeholder: "+974 1234 5678" },
    { name: "subject", label: "Subject", type: "text", required: true, placeholder: "Complaint subject..." },
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
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customer-service-operations/complaints" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Complaint</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CsoForm
          entityType="Complaint"
          apiPath="/api/v1/customer-service-operations/complaints"
          fields={COMPLAINT_FIELDS}
          returnPath="/customer-service-operations/complaints"
        />
      </div>
    </div>
  );
}
