import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { VrsForm } from "@/components/voyage-results-settlement/vrs-form";
import type { FieldConfig } from "@/components/voyage-results-settlement/vrs-form";

const fields: FieldConfig[] = [
  {
    name: "closeType",
    label: "Close Type",
    type: "select",
    required: true,
    options: [
      { value: "preliminary", label: "Preliminary" },
      { value: "final", label: "Final" },
      { value: "interim", label: "Interim" },
      { value: "reopened", label: "Reopened" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
  {
    name: "title",
    label: "Title",
    type: "text",
    required: false,
  },
  {
    name: "voyageNumber",
    label: "Voyage Number",
    type: "text",
    required: false,
  },
  {
    name: "vesselName",
    label: "Vessel Name",
    type: "text",
    required: false,
  },
  {
    name: "voyageStartDate",
    label: "Voyage Start Date",
    type: "datetime-local",
    required: false,
  },
  {
    name: "voyageEndDate",
    label: "Voyage End Date",
    type: "datetime-local",
    required: false,
  },
  {
    name: "signOffBy",
    label: "Sign Off By",
    type: "text",
    required: false,
  },
  {
    name: "signOffDate",
    label: "Sign Off Date",
    type: "datetime-local",
    required: false,
  },
  {
    name: "totalRevenue",
    label: "Total Revenue",
    type: "number",
    required: false,
  },
  {
    name: "totalCost",
    label: "Total Cost",
    type: "number",
    required: false,
  },
  {
    name: "netResult",
    label: "Net Result",
    type: "number",
    required: false,
  },
  {
    name: "isSignedOff",
    label: "Is Signed Off",
    type: "checkbox",
    required: false,
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    required: false,
  },
];

export default async function NewVoyageClosePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "vrs:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/voyage-results-settlement/voyage-closes"
          className="rounded-md border p-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Voyage Close</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <VrsForm
          entityType="Voyage Close"
          apiPath="/api/v1/voyage-results-settlement/voyage-closes"
          fields={fields}
          returnPath="/voyage-results-settlement/voyage-closes"
        />
      </div>
    </div>
  );
}
