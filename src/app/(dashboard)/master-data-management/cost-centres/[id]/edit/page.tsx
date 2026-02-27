import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { costCentres } from "@/db/schema";
import { MdmForm } from "@/components/master-data-management/mdm-form";

const COST_CENTRE_FIELDS = [
  { name: "code", label: "Cost Centre Code", type: "text" as const, required: true },
  { name: "name", label: "Name", type: "text" as const, required: true },
  { name: "department", label: "Department", type: "text" as const },
  { name: "description", label: "Description", type: "textarea" as const },
];

export default async function EditCostCentrePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "finance:approve")))
    redirect("/master-data-management/cost-centres");

  const { id } = await params;

  const costCentre = await db
    .select()
    .from(costCentres)
    .where(
      and(
        eq(costCentres.id, id),
        eq(costCentres.tenantId, session.tenantId),
        isNull(costCentres.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!costCentre) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/master-data-management/cost-centres/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Cost Centre</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MdmForm
          entityType="Cost Centre"
          apiPath={`/api/v1/master-data-management/cost-centres/${id}`}
          fields={COST_CENTRE_FIELDS}
          initialData={{
            code: costCentre.code,
            name: costCentre.name,
            department: costCentre.department ?? "",
            description: costCentre.description ?? "",
          }}
          isEdit
          returnPath={`/master-data-management/cost-centres/${id}`}
        />
      </div>
    </div>
  );
}
