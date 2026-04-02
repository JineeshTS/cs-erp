import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { scmCustomerSegments } from "@/db/schema";
import { ScmForm } from "@/components/sales-crm/scm-form";
import type { FieldConfig } from "@/components/sales-crm/scm-form";

const SEGMENT_FIELDS: FieldConfig[] = [
  { name: "segmentName", label: "Segment Name", type: "text", required: true },
  { name: "segmentCode", label: "Segment Code", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "color", label: "Color", type: "text", placeholder: "#FF0000" },
  { name: "sortOrder", label: "Sort Order", type: "number" },
  { name: "isActive", label: "Active", type: "checkbox" },
];

export default async function EditCustomerSegmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:edit")))
    redirect("/sales-crm");

  const { id } = await params;
  const record = await db
    .select()
    .from(scmCustomerSegments)
    .where(
      and(
        eq(scmCustomerSegments.id, id),
        eq(scmCustomerSegments.tenantId, session.tenantId),
        isNull(scmCustomerSegments.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    segmentName: record.segmentName,
    segmentCode: record.segmentCode,
    description: record.description ?? "",
    color: record.color ?? "",
    sortOrder: record.sortOrder ?? 0,
    isActive: record.isActive ?? true,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/sales-crm/customer-segments/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Segment
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Segment"
          apiPath={`/api/v1/sales-crm/customer-segments/${id}`}
          fields={SEGMENT_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/sales-crm/customer-segments/${id}`}
        />
      </div>
    </div>
  );
}
