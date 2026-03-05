import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getReturnIncentive } from "@/lib/empty-container-repositioning-ai/service";
import {
  EcrForm,
  type FieldConfig,
} from "@/components/empty-container-repositioning-ai/ecr-form";

export default async function EditReturnIncentivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ecr:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getReturnIncentive(id, session.tenantId);
  if (!record) notFound();

  const fields: FieldConfig[] = [
    {
      name: "incentiveType",
      label: "Incentive Type",
      type: "select",
      options: [
        { label: "Flat Discount", value: "flat_discount" },
        { label: "Percentage Rebate", value: "percentage_rebate" },
        { label: "Free Storage", value: "free_storage" },
        { label: "Priority Booking", value: "priority_booking" },
        { label: "Loyalty Bonus", value: "loyalty_bonus" },
      ],
      required: true,
    },
    { name: "title", label: "Title", type: "text", required: true },
    {
      name: "customerName",
      label: "Customer Name",
      type: "text",
      required: true,
    },
    { name: "tradeLane", label: "Trade Lane", type: "text", required: true },
    {
      name: "containerType",
      label: "Container Type",
      type: "text",
      required: true,
    },
    {
      name: "targetLocation",
      label: "Target Location",
      type: "text",
      required: true,
    },
    {
      name: "incentiveValue",
      label: "Incentive Value",
      type: "text",
      required: true,
    },
    { name: "currency", label: "Currency", type: "text", required: true },
    {
      name: "validFrom",
      label: "Valid From",
      type: "datetime-local",
      required: true,
    },
    {
      name: "validTo",
      label: "Valid To",
      type: "datetime-local",
      required: true,
    },
    {
      name: "utilizationCount",
      label: "Utilization Count",
      type: "number",
      required: false,
    },
    {
      name: "isActive",
      label: "Is Active",
      type: "checkbox",
      required: false,
    },
    { name: "notes", label: "Notes", type: "textarea", required: false },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/empty-container-repositioning-ai/return-incentives/${id}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit Return Incentive
          </h1>
          <p className="text-muted-foreground">{record.incentiveRef}</p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <EcrForm
          entityType="return-incentives"
          apiPath="/api/v1/empty-container-repositioning-ai/return-incentives"
          fields={fields}
          initialData={record}
          isEdit
          returnPath={`/empty-container-repositioning-ai/return-incentives/${id}`}
        />
      </div>
    </div>
  );
}
