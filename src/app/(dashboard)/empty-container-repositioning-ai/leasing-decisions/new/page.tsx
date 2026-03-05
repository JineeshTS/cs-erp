import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import {
  EcrForm,
  type FieldConfig,
} from "@/components/empty-container-repositioning-ai/ecr-form";

const fields: FieldConfig[] = [
  {
    name: "decisionType",
    label: "Decision Type",
    type: "select",
    options: [
      { label: "Lease In", value: "lease_in" },
      { label: "Lease Out", value: "lease_out" },
      { label: "Reposition", value: "reposition" },
      { label: "Buy", value: "buy" },
      { label: "Sell", value: "sell" },
    ],
    required: true,
  },
  { name: "title", label: "Title", type: "text", required: true },
  {
    name: "locationCode",
    label: "Location Code",
    type: "text",
    required: true,
  },
  {
    name: "containerType",
    label: "Container Type",
    type: "text",
    required: true,
  },
  { name: "quantity", label: "Quantity", type: "number", required: true },
  { name: "repositionCost", label: "Reposition Cost", type: "text" },
  { name: "leasingCost", label: "Leasing Cost", type: "text" },
  { name: "breakEvenDays", label: "Break-Even Days", type: "number" },
  {
    name: "recommendedAction",
    label: "Recommended Action",
    type: "text",
    required: true,
  },
  { name: "savingsAmount", label: "Savings Amount", type: "text" },
  {
    name: "aiRecommendation",
    label: "AI Recommendation",
    type: "textarea",
  },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewLeasingDecisionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ecr:create")))
    redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/empty-container-repositioning-ai/leasing-decisions"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Leasing Decision
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new container leasing or repositioning decision
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <EcrForm
          entityType="leasing-decisions"
          apiPath="/api/v1/empty-container-repositioning-ai/leasing-decisions"
          fields={fields}
          returnPath="/empty-container-repositioning-ai/leasing-decisions"
        />
      </div>
    </div>
  );
}
