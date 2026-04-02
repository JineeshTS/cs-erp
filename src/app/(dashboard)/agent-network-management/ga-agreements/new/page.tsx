import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { AnmForm } from "@/components/agent-network-management/anm-form";
import type { FieldConfig } from "@/components/agent-network-management/anm-form";
import { getCustomerOptions } from "@/lib/lookups";

export default async function NewGaAgreementPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "anm:create")))
    redirect("/agent-network-management/ga-agreements");

  const customerOpts = await getCustomerOptions(session.tenantId);

  const fields: FieldConfig[] = [
    {
      name: "agreementType",
      label: "Agreement Type",
      type: "select",
      required: true,
      options: [
        { value: "exclusive_ga", label: "Exclusive GA" },
        { value: "non_exclusive_ga", label: "Non-Exclusive GA" },
        { value: "liner_agency", label: "Liner Agency" },
        { value: "tramp_agency", label: "Tramp Agency" },
        { value: "port_agency", label: "Port Agency" },
      ],
    },
    { name: "agentName", label: "Agent Name", type: "select", options: customerOpts },
    { name: "agentCode", label: "Agent Code", type: "text" },
    { name: "territory", label: "Territory", type: "text" },
    { name: "portsCovered", label: "Ports Covered", type: "textarea" },
    { name: "commencementDate", label: "Commencement Date", type: "datetime-local" },
    { name: "expiryDate", label: "Expiry Date", type: "datetime-local" },
    { name: "autoRenewal", label: "Auto Renewal", type: "checkbox" },
    { name: "terminationNoticeDays", label: "Termination Notice Days", type: "number" },
    { name: "baseCommissionPct", label: "Base Commission %", type: "text" },
    { name: "commissionCurrency", label: "Commission Currency", type: "text" },
    { name: "exclusivityClause", label: "Exclusivity Clause", type: "checkbox" },
    { name: "performanceGuarantee", label: "Performance Guarantee", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/agent-network-management/ga-agreements"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to GA Agreements
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">
          New GA Agreement
        </h1>
      </div>

      <AnmForm
        entityType="GA Agreement"
        apiPath="/api/v1/agent-network-management/ga-agreements"
        fields={fields}
        returnPath="/agent-network-management/ga-agreements"
      />
    </div>
  );
}
