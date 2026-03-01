import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getCostCentre } from "@/lib/costing-financial-management/service";
import { Badge } from "@/components/ui/badge";

export default async function CostCentreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:read")))
    redirect("/");

  const { id } = await params;
  const centre = await getCostCentre(id, session.tenantId);
  if (!centre) notFound();

  const canEdit = await hasPermission(
    session.id,
    session.tenantId,
    "costing:edit"
  );

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Centre Code", value: centre.centreCode },
    { label: "Centre Name", value: centre.centreName },
    { label: "Centre Type", value: centre.centreType },
    { label: "Department", value: centre.department },
    { label: "Manager Name", value: centre.managerName },
    { label: "Currency", value: centre.currency },
    { label: "Annual Budget", value: centre.annualBudget },
    { label: "YTD Actual", value: centre.ytdActual },
    { label: "YTD Budget", value: centre.ytdBudget },
    {
      label: "Active",
      value: (
        <Badge variant={centre.isActive ? "success" : "secondary"}>
          {centre.isActive ? "Yes" : "No"}
        </Badge>
      ),
    },
    { label: "GL Account Code", value: centre.glAccountCode },
    { label: "Notes", value: centre.notes },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/costing-financial-management/cost-centres"
            className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {centre.centreCode} - {centre.centreName}
            </h1>
            <p className="text-sm text-gray-500">Cost Centre Details</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/costing-financial-management/cost-centres/${centre.id}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <dl className="divide-y">
          {fields.map((f) => (
            <div
              key={f.label}
              className="grid grid-cols-3 gap-4 px-6 py-4 sm:grid-cols-4"
            >
              <dt className="text-sm font-medium text-gray-500">{f.label}</dt>
              <dd className="col-span-2 text-sm text-gray-900 sm:col-span-3">
                {f.value ?? <span className="text-gray-400">--</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
