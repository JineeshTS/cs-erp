import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { adminApprovalMatrices } from "@/db/schema";
import { AdminForm } from "@/components/admin-portal/admin-form";
import type { FieldConfig } from "@/components/admin-portal/admin-form";

const MATRIX_FIELDS: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  {
    name: "entityType",
    label: "Entity Type",
    type: "select",
    required: true,
    options: [
      { value: "booking", label: "Booking" },
      { value: "invoice", label: "Invoice" },
      { value: "payment", label: "Payment" },
      { value: "shipment", label: "Shipment" },
      { value: "customs_declaration", label: "Customs Declaration" },
    ],
  },
  {
    name: "conditionField",
    label: "Condition Field",
    type: "text",
    required: true,
  },
  {
    name: "conditionOperator",
    label: "Condition Operator",
    type: "select",
    options: [
      { value: "eq", label: "Equal to (=)" },
      { value: "gt", label: "Greater than (>)" },
      { value: "gte", label: "Greater than or equal (>=)" },
      { value: "lt", label: "Less than (<)" },
      { value: "lte", label: "Less than or equal (<=)" },
      { value: "ne", label: "Not equal (!=)" },
    ],
  },
  {
    name: "thresholdAmount",
    label: "Threshold Amount (smallest currency unit)",
    type: "number",
  },
  {
    name: "currency",
    label: "Currency",
    type: "select",
    options: [
      { value: "QAR", label: "QAR" },
      { value: "AED", label: "AED" },
      { value: "SAR", label: "SAR" },
      { value: "INR", label: "INR" },
      { value: "USD", label: "USD" },
    ],
  },
  {
    name: "approverRoleId",
    label: "Approver Role ID",
    type: "text",
    placeholder: "Role UUID",
  },
  {
    name: "approverUserId",
    label: "Approver User ID",
    type: "text",
    placeholder: "User UUID",
  },
  {
    name: "requiredApprovals",
    label: "Required Approvals",
    type: "number",
    placeholder: "1",
  },
  {
    name: "escalationTimeoutMinutes",
    label: "Escalation Timeout (minutes)",
    type: "number",
  },
  { name: "isActive", label: "Active", type: "checkbox" },
  { name: "sortOrder", label: "Sort Order", type: "number", placeholder: "0" },
];

export default async function EditApprovalMatrixPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "admin:edit")))
    redirect("/admin-portal/approval-matrices");

  const { id } = await params;

  const matrix = await db
    .select()
    .from(adminApprovalMatrices)
    .where(
      and(
        eq(adminApprovalMatrices.id, id),
        eq(adminApprovalMatrices.tenantId, session.tenantId),
        isNull(adminApprovalMatrices.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!matrix) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/admin-portal/approval-matrices/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Approval Matrix
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AdminForm
          entityType="Approval Matrix"
          apiPath={`/api/v1/admin-portal/approval-matrices/${id}`}
          fields={MATRIX_FIELDS}
          initialData={{
            name: matrix.name,
            slug: matrix.slug,
            description: matrix.description ?? "",
            entityType: matrix.entityType,
            conditionField: matrix.conditionField,
            conditionOperator: matrix.conditionOperator,
            thresholdAmount: matrix.thresholdAmount,
            currency: matrix.currency,
            approverRoleId: matrix.approverRoleId ?? "",
            approverUserId: matrix.approverUserId ?? "",
            requiredApprovals: matrix.requiredApprovals,
            escalationTimeoutMinutes:
              matrix.escalationTimeoutMinutes ?? "",
            isActive: matrix.isActive,
            sortOrder: matrix.sortOrder,
          }}
          isEdit
          returnPath={`/admin-portal/approval-matrices/${id}`}
        />
      </div>
    </div>
  );
}
