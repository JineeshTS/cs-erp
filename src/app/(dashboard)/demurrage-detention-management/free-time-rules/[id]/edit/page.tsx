import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getFreeTimeRule } from "@/lib/demurrage-detention-management/service";
import { DdmForm } from "@/components/demurrage-detention-management/ddm-form";
import type { FieldConfig } from "@/components/demurrage-detention-management/ddm-form";
import { getPortOptions, getCustomerOptions } from "@/lib/lookups";

export default async function EditFreeTimeRulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "demurrage:edit")))
    redirect("/demurrage-detention-management/free-time-rules");

  const [portOpts, customerOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
  ]);

  const RULE_FIELDS: FieldConfig[] = [
    { name: "ruleName", label: "Rule Name", type: "text", required: true },
    {
      name: "ruleType",
      label: "Rule Type",
      type: "select",
      required: true,
      options: [
        { value: "demurrage", label: "Demurrage" },
        { value: "detention", label: "Detention" },
        { value: "combined", label: "Combined" },
      ],
    },
    {
      name: "applicableTo",
      label: "Applicable To",
      type: "select",
      required: true,
      options: [
        { value: "all", label: "All" },
        { value: "port", label: "Port" },
        { value: "customer", label: "Customer" },
        { value: "container_type", label: "Container Type" },
        { value: "trade_lane", label: "Trade Lane" },
      ],
    },
    { name: "portName", label: "Port Name", type: "select", options: portOpts },
    { name: "portCountry", label: "Port Country", type: "text" },
    { name: "containerSize", label: "Container Size", type: "text" },
    { name: "containerType", label: "Container Type", type: "text" },
    { name: "customerName", label: "Customer Name", type: "select", options: customerOpts },
    { name: "freeTimeDays", label: "Free Time Days", type: "number", required: true },
    { name: "gracePeriodDays", label: "Grace Period Days", type: "number" },
    { name: "weekendsExcluded", label: "Weekends Excluded", type: "checkbox" },
    { name: "holidaysExcluded", label: "Holidays Excluded", type: "checkbox" },
    { name: "effectiveFrom", label: "Effective From", type: "datetime-local", required: true },
    { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
    { name: "priority", label: "Priority", type: "number" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;

  const rule = await getFreeTimeRule(id, session.tenantId);
  if (!rule) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/demurrage-detention-management/free-time-rules/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Free Time Rule
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <DdmForm
          entityType="Free Time Rule"
          apiPath={`/api/v1/demurrage-detention-management/free-time-rules/${id}`}
          fields={RULE_FIELDS}
          initialData={{
            ruleName: rule.ruleName ?? "",
            ruleType: rule.ruleType ?? "",
            applicableTo: rule.applicableTo ?? "",
            portName: rule.portName ?? "",
            portCountry: rule.portCountry ?? "",
            containerSize: rule.containerSize ?? "",
            containerType: rule.containerType ?? "",
            customerName: rule.customerName ?? "",
            freeTimeDays: rule.freeTimeDays ?? "",
            gracePeriodDays: rule.gracePeriodDays ?? "",
            weekendsExcluded: rule.weekendsExcluded ?? false,
            holidaysExcluded: rule.holidaysExcluded ?? false,
            effectiveFrom: rule.effectiveFrom
              ? new Date(rule.effectiveFrom).toISOString()
              : "",
            effectiveTo: rule.effectiveTo
              ? new Date(rule.effectiveTo).toISOString()
              : "",
            priority: rule.priority ?? "",
            notes: rule.notes ?? "",
          }}
          isEdit
          returnPath={`/demurrage-detention-management/free-time-rules/${id}`}
        />
      </div>
    </div>
  );
}
