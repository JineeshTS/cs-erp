import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CapForm } from "@/components/capacity-voyage-management/cap-form";
import type { FieldConfig } from "@/components/capacity-voyage-management/cap-form";

const FIELDS: FieldConfig[] = [
  {
    name: "vesselScheduleId",
    label: "Vessel Schedule ID",
    type: "text",
  },
  {
    name: "tradeLane",
    label: "Trade Lane",
    type: "text",
  },
  {
    name: "originPort",
    label: "Origin Port",
    type: "text",
  },
  {
    name: "destinationPort",
    label: "Destination Port",
    type: "text",
  },
  {
    name: "periodFrom",
    label: "Period From",
    type: "datetime-local",
    required: true,
  },
  {
    name: "periodTo",
    label: "Period To",
    type: "datetime-local",
    required: true,
  },
  {
    name: "totalTeu",
    label: "Total TEU",
    type: "number",
  },
  {
    name: "totalRevenue",
    label: "Total Revenue",
    type: "number",
  },
  {
    name: "revenuePerTeu",
    label: "Revenue per TEU",
    type: "number",
  },
  {
    name: "averageRate",
    label: "Average Rate",
    type: "number",
  },
  {
    name: "currency",
    label: "Currency",
    type: "text",
    placeholder: "USD",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "calculated", label: "Calculated" },
      { value: "published", label: "Published" },
    ],
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
  },
];

export default async function NewRevenueAnalyticsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "capacity:create"))
  )
    redirect("/capacity-voyage-management");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/capacity-voyage-management/revenue-analytics"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Revenue Analytics
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CapForm
          entityType="Revenue Analytics"
          apiPath="/api/v1/capacity-voyage-management/revenue-analytics"
          fields={FIELDS}
          returnPath="/capacity-voyage-management/revenue-analytics"
        />
      </div>
    </div>
  );
}
