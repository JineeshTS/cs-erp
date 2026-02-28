import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { csoCustomerFeedback } from "@/db/schema";
import { CsoForm } from "@/components/customer-service-operations/cso-form";
import type { FieldConfig } from "@/components/customer-service-operations/cso-form";

const FEEDBACK_FIELDS: FieldConfig[] = [
  { name: "entityType", label: "Entity Type", type: "select", required: true, options: [
    { value: "inquiry", label: "Inquiry" },
    { value: "complaint", label: "Complaint" },
    { value: "service_request", label: "Service Request" },
  ]},
  { name: "entityId", label: "Entity ID", type: "text", required: true },
  { name: "customerName", label: "Customer Name", type: "text" },
  { name: "rating", label: "Rating", type: "number" },
  { name: "satisfactionScore", label: "Satisfaction Score", type: "number" },
  { name: "feedbackText", label: "Feedback Text", type: "textarea" },
  { name: "feedbackChannel", label: "Feedback Channel", type: "text" },
];

export default async function EditCustomerFeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "customer_service:edit")))
    redirect("/customer-service-operations/customer-feedback");

  const { id } = await params;
  const record = await db
    .select()
    .from(csoCustomerFeedback)
    .where(
      and(
        eq(csoCustomerFeedback.id, id),
        eq(csoCustomerFeedback.tenantId, session.tenantId),
        isNull(csoCustomerFeedback.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    entityType: record.entityType,
    entityId: record.entityId,
    customerName: record.customerName ?? "",
    rating: record.rating ?? "",
    satisfactionScore: record.satisfactionScore ?? "",
    feedbackText: record.feedbackText ?? "",
    feedbackChannel: record.feedbackChannel ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/customer-service-operations/customer-feedback/${id}`} className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Feedback</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <CsoForm
          entityType="Feedback"
          apiPath={`/api/v1/customer-service-operations/customer-feedback/${id}`}
          fields={FEEDBACK_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/customer-service-operations/customer-feedback/${id}`}
        />
      </div>
    </div>
  );
}
