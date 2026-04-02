import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { MdmForm } from "@/components/master-data-management/mdm-form";

const COST_CENTRE_FIELDS = [
  { name: "code", label: "Cost Centre Code", type: "text" as const, required: true },
  { name: "name", label: "Name", type: "text" as const, required: true },
  { name: "department", label: "Department", type: "text" as const },
  { name: "description", label: "Description", type: "textarea" as const },
];

export default async function NewCostCentrePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "masterdata:create")))
    redirect("/master-data-management/cost-centres");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/master-data-management/cost-centres"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Cost Centre</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MdmForm
          entityType="Cost Centre"
          apiPath="/api/v1/master-data-management/cost-centres"
          fields={COST_CENTRE_FIELDS}
          returnPath="/master-data-management/cost-centres"
        />
      </div>
    </div>
  );
}
