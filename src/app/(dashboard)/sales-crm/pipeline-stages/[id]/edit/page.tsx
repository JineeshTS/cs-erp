import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { scmPipelineStages } from "@/db/schema";
import { ScmForm } from "@/components/sales-crm/scm-form";
import type { FieldConfig } from "@/components/sales-crm/scm-form";

const STAGE_FIELDS: FieldConfig[] = [
  { name: "stageName", label: "Stage Name", type: "text", required: true },
  { name: "stageCode", label: "Stage Code", type: "text", required: true },
  { name: "sortOrder", label: "Sort Order", type: "number" },
  { name: "probability", label: "Probability %", type: "number", placeholder: "0-100" },
  { name: "color", label: "Color", type: "text" },
  { name: "isWon", label: "Won Stage", type: "checkbox" },
  { name: "isLost", label: "Lost Stage", type: "checkbox" },
  { name: "isActive", label: "Active", type: "checkbox" },
];

export default async function EditPipelineStagePage({
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
    .from(scmPipelineStages)
    .where(
      and(
        eq(scmPipelineStages.id, id),
        eq(scmPipelineStages.tenantId, session.tenantId),
        isNull(scmPipelineStages.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    stageName: record.stageName,
    stageCode: record.stageCode,
    sortOrder: record.sortOrder ?? 0,
    probability: record.probability ?? 0,
    color: record.color ?? "",
    isWon: record.isWon ?? false,
    isLost: record.isLost ?? false,
    isActive: record.isActive ?? true,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/sales-crm/pipeline-stages/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Pipeline Stage
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Pipeline Stage"
          apiPath={`/api/v1/sales-crm/pipeline-stages/${id}`}
          fields={STAGE_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/sales-crm/pipeline-stages/${id}`}
        />
      </div>
    </div>
  );
}
