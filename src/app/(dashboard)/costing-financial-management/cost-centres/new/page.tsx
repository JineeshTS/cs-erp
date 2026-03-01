import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import {
  CfmForm,
  type FieldConfig,
} from "@/components/costing-financial-management/cfm-form";

export default async function NewCostCentrePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:create")))
    redirect("/");

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/costing-financial-management/cost-centres"
          className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New Cost Centre
          </h1>
          <p className="text-sm text-gray-500">Create a new cost centre</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CfmForm
          entityType="Cost Centre"
          apiPath="/api/v1/costing-financial-management/cost-centres"
          fields={fields}
          returnPath="/costing-financial-management/cost-centres"
        />
      </div>
    </div>
  );
}
