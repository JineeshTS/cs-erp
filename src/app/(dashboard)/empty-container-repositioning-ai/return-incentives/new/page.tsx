import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import {
  EcrForm,
  type FieldConfig,
} from "@/components/empty-container-repositioning-ai/ecr-form";
import { getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewReturnIncentivePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "ecr:create")))
    redirect("/");


  const [customerOpts, currencyOpts] = await Promise.all([
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);
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
      type: "select", options: customerOpts,
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
    { name: "currency", label: "Currency", type: "select", options: currencyOpts, required: true },
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
          href="/empty-container-repositioning-ai/return-incentives"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            New Return Incentive
          </h1>
          <p className="text-muted-foreground">
            Create a new return incentive program.
          </p>
        </div>
      </div>

      <div className="rounded-md border p-6">
        <EcrForm
          entityType="return-incentives"
          apiPath="/api/v1/empty-container-repositioning-ai/return-incentives"
          fields={fields}
          returnPath="/empty-container-repositioning-ai/return-incentives"
        />
      </div>
    </div>
  );
}
