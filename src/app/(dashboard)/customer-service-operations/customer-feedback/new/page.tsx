import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CsoForm } from "@/components/customer-service-operations/cso-form";
import type { FieldConfig } from "@/components/customer-service-operations/cso-form";

const FEEDBACK_FIELDS: FieldConfig[] = [
  { name: "entityType", label: "Entity Type", type: "select", required: true, options: [
    { value: "inquiry", label: "Inquiry" },
    { value: "complaint", label: "Complaint" },
    { value: "service_request", label: "Service Request" },
  ]},
  { name: "entityId", label: "Entity ID", type: "text", required: true, placeholder: "Related entity UUID" },
  { name: "customerName", label: "Customer Name", type: "text", placeholder: "Customer name" },
  { name: "rating", label: "Rating", type: "number", placeholder: "1-5" },
  { name: "satisfactionScore", label: "Satisfaction Score", type: "number", placeholder: "0-100" },
  { name: "feedbackText", label: "Feedback Text", type: "textarea", placeholder: "Customer feedback..." },
  { name: "feedbackChannel", label: "Feedback Channel", type: "text", placeholder: "e.g. email, phone, survey" },
];

export default async function NewCustomerFeedbackPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customer_service:create")))
    redirect("/customer-service-operations/customer-feedback");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customer-service-operations/customer-feedback" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Feedback</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CsoForm
          entityType="Feedback"
          apiPath="/api/v1/customer-service-operations/customer-feedback"
          fields={FEEDBACK_FIELDS}
          returnPath="/customer-service-operations/customer-feedback"
        />
      </div>
    </div>
  );
}
