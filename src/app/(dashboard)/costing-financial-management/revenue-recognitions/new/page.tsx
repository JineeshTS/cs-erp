import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CfmForm, type FieldConfig } from "@/components/costing-financial-management/cfm-form";
import { getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function NewRevenueRecognitionPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "costing:create")))
    redirect("/");

  const [customerOpts, currencyOpts] = await Promise.all([
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const fields: FieldConfig[] = [
    { name: "voyageRef", label: "Voyage Ref", type: "text" },
    { name: "bookingRef", label: "Booking Ref", type: "text" },
    { name: "blNumber", label: "BL Number", type: "text" },
    { name: "customerName", label: "Customer Name", type: "select", options: customerOpts },
    {
      name: "revenueType",
      label: "Revenue Type",
      type: "select",
      required: true,
      options: [
        { value: "freight", label: "Freight" },
        { value: "demurrage", label: "Demurrage" },
        { value: "detention", label: "Detention" },
        { value: "surcharge", label: "Surcharge" },
        { value: "reefer", label: "Reefer" },
        { value: "documentation", label: "Documentation" },
        { value: "other", label: "Other" },
      ],
    },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    {
      name: "grossRevenue",
      label: "Gross Revenue",
      type: "number",
      required: true,
    },
    { name: "deductions", label: "Deductions", type: "number" },
    { name: "netRevenue", label: "Net Revenue", type: "number", required: true },
    {
      name: "recognitionMethod",
      label: "Recognition Method",
      type: "select",
      required: true,
      options: [
        { value: "point_in_time", label: "Point in Time" },
        { value: "over_time", label: "Over Time" },
        { value: "percentage_of_completion", label: "Percentage of Completion" },
        { value: "completed_voyage", label: "Completed Voyage" },
      ],
    },
    {
      name: "performanceObligation",
      label: "Performance Obligation",
      type: "text",
    },
    { name: "completionPercent", label: "Completion %", type: "number" },
    {
      name: "recognizedAmount",
      label: "Recognized Amount",
      type: "number",
      required: true,
    },
    { name: "deferredAmount", label: "Deferred Amount", type: "number" },
    { name: "recognitionPeriod", label: "Recognition Period", type: "text" },
    { name: "journalEntryRef", label: "Journal Entry Ref", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const basePath = "/costing-financial-management/revenue-recognitions";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={basePath}
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New Revenue Recognition
          </h1>
          <p className="text-sm text-gray-500">
            Create a new revenue recognition record
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CfmForm
          entityType="Revenue Recognition"
          apiPath="/api/v1/costing-financial-management/revenue-recognitions"
          fields={fields}
          returnPath={basePath}
        />
      </div>
    </div>
  );
}
