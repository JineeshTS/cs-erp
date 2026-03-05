import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import {
  EcrForm,
  type FieldConfig,
} from "@/components/empty-container-repositioning-ai/ecr-form";

const fields: FieldConfig[] = [
  {
    name: "costType",
    label: "Cost Type",
    type: "select",
    required: true,
    options: [
      { label: "Inland Transport", value: "inland_transport" },
      { label: "Ocean Freight", value: "ocean_freight" },
      { label: "Handling", value: "handling" },
      { label: "Storage", value: "storage" },
      { label: "Repair", value: "repair" },
      { label: "Repositioning Fee", value: "repositioning_fee" },
    ],
  },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "planRef", label: "Plan Ref", type: "text" },
  { name: "containerType", label: "Container Type", type: "text" },
  { name: "quantity", label: "Quantity", type: "number" },
  { name: "unitCost", label: "Unit Cost", type: "text" },
  { name: "totalCost", label: "Total Cost", type: "text" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "approvedBy", label: "Approved By", type: "text" },
  { name: "approvedDate", label: "Approved Date", type: "datetime-local" },
  { name: "isApproved", label: "Is Approved", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewCostTrackingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ecr:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/empty-container-repositioning-ai/cost-trackings"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          New Cost Tracking
        </h1>
      </div>

      <div className="rounded-lg border p-6">
        <EcrForm
          entityType="cost-trackings"
          apiPath="/api/v1/empty-container-repositioning-ai/cost-trackings"
          fields={fields}
          returnPath="/empty-container-repositioning-ai/cost-trackings"
        />
      </div>
    </div>
  );
}
