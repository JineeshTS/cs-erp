import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getCostCentre } from "@/lib/costing-financial-management/service";
import {
  CfmForm,
  type FieldConfig,
} from "@/components/costing-financial-management/cfm-form";

export default async function EditCostCentrePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:edit")))
    redirect("/");

  const { id } = await params;
  const centre = await getCostCentre(id, session.tenantId);
  if (!centre) notFound();

  const fields: FieldConfig[] = [
    { name: "centreCode", label: "Centre Code", type: "text", required: true },
    { name: "centreName", label: "Centre Name", type: "text", required: true },
    {
      name: "centreType",
      label: "Centre Type",
      type: "select",
      required: true,
      options: [
        { value: "vessel", label: "Vessel" },
        { value: "department", label: "Department" },
        { value: "project", label: "Project" },
        { value: "region", label: "Region" },
        { value: "service_route", label: "Service Route" },
        { value: "overhead", label: "Overhead" },
        { value: "other", label: "Other" },
      ],
    },
    { name: "department", label: "Department", type: "text" },
    { name: "managerName", label: "Manager Name", type: "text" },
    {
      name: "currency",
      label: "Currency",
      type: "text",
      placeholder: "USD",
    },
    { name: "annualBudget", label: "Annual Budget", type: "number" },
    { name: "isActive", label: "Active", type: "checkbox" },
    { name: "glAccountCode", label: "GL Account Code", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const initialData: Record<string, unknown> = {
    centreCode: centre.centreCode,
    centreName: centre.centreName,
    centreType: centre.centreType,
    department: centre.department,
    managerName: centre.managerName,
    currency: centre.currency,
    annualBudget: centre.annualBudget,
    isActive: centre.isActive,
    glAccountCode: centre.glAccountCode,
    notes: centre.notes,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/costing-financial-management/cost-centres/${centre.id}`}
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit {centre.centreCode}
          </h1>
          <p className="text-sm text-gray-500">Update cost centre details</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CfmForm
          entityType="Cost Centre"
          apiPath={`/api/v1/costing-financial-management/cost-centres/${centre.id}`}
          fields={fields}
          initialData={initialData}
          isEdit
          returnPath="/costing-financial-management/cost-centres"
        />
      </div>
    </div>
  );
}
