import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { isfIamPolicies } from "@/db/schema";
import { IsfForm } from "@/components/infrastructure-security/isf-form";
import type { FieldConfig } from "@/components/infrastructure-security/isf-form";

const POLICY_FIELDS: FieldConfig[] = [
  {
    name: "policyName",
    label: "Policy Name",
    type: "text",
    required: true,
  },
  {
    name: "policyCode",
    label: "Policy Code",
    type: "text",
    required: true,
  },
  {
    name: "policyType",
    label: "Policy Type",
    type: "select",
    required: true,
    options: [
      { value: "rbac", label: "RBAC" },
      { value: "abac", label: "ABAC" },
      { value: "resource", label: "Resource" },
      { value: "network", label: "Network" },
      { value: "custom", label: "Custom" },
    ],
  },
  {
    name: "effect",
    label: "Effect",
    type: "select",
    required: true,
    options: [
      { value: "allow", label: "Allow" },
      { value: "deny", label: "Deny" },
    ],
  },
  { name: "description", label: "Description", type: "textarea" },
  { name: "priority", label: "Priority", type: "number" },
  { name: "isActive", label: "Active", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditIamPolicyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "infra:edit")))
    redirect("/infrastructure-security");

  const { id } = await params;
  const record = await db
    .select()
    .from(isfIamPolicies)
    .where(
      and(
        eq(isfIamPolicies.id, id),
        eq(isfIamPolicies.tenantId, session.tenantId),
        isNull(isfIamPolicies.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    policyName: record.policyName,
    policyCode: record.policyCode,
    policyType: record.policyType,
    effect: record.effect,
    description: record.description ?? "",
    priority: record.priority ?? "",
    isActive: record.isActive,
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/infrastructure-security/iam-policies/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit IAM Policy</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <IsfForm
          entityType="IAM Policy"
          apiPath={`/api/v1/infrastructure-security/iam/policies/${id}`}
          fields={POLICY_FIELDS}
          initialData={initialData}
          isEdit
          method="PUT"
          returnPath={`/infrastructure-security/iam-policies/${id}`}
        />
      </div>
    </div>
  );
}
