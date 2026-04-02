import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
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

export default async function NewPipelineStagePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:create")))
    redirect("/sales-crm");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/sales-crm/pipeline-stages"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Pipeline Stage
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Pipeline Stage"
          apiPath="/api/v1/sales-crm/pipeline-stages"
          fields={STAGE_FIELDS}
          returnPath="/sales-crm/pipeline-stages"
        />
      </div>
    </div>
  );
}
