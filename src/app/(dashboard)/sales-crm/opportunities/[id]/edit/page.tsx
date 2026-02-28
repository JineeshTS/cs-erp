import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { scmOpportunities } from "@/db/schema";
import { ScmForm } from "@/components/sales-crm/scm-form";
import type { FieldConfig } from "@/components/sales-crm/scm-form";

const OPPORTUNITY_FIELDS: FieldConfig[] = [
  { name: "opportunityName", label: "Opportunity Name", type: "text", required: true },
  { name: "opportunityCode", label: "Opportunity Code", type: "text" },
  { name: "customerId", label: "Customer ID", type: "text", required: true, placeholder: "UUID of the customer" },
  { name: "contactId", label: "Contact ID", type: "text" },
  { name: "stageId", label: "Stage ID", type: "text" },
  { name: "ownerId", label: "Owner ID", type: "text", required: true, placeholder: "UUID of the owner" },
  { name: "expectedRevenue", label: "Expected Revenue", type: "number" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "probability", label: "Probability %", type: "number" },
  { name: "expectedTeu", label: "Expected TEU", type: "number" },
  { name: "tradeLane", label: "Trade Lane", type: "text" },
  { name: "originPort", label: "Origin Port", type: "text" },
  { name: "destinationPort", label: "Destination Port", type: "text" },
  { name: "serviceType", label: "Service Type", type: "select", options: [
    { value: "fcl", label: "FCL" },
    { value: "lcl", label: "LCL" },
    { value: "breakbulk", label: "Breakbulk" },
    { value: "reefer", label: "Reefer" },
    { value: "tanker", label: "Tanker" },
  ]},
  { name: "expectedCloseDate", label: "Expected Close Date", type: "date" },
  { name: "lostReason", label: "Lost Reason", type: "text" },
  { name: "competitorName", label: "Competitor Name", type: "text" },
  { name: "source", label: "Source", type: "text" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "open", label: "Open" },
    { value: "won", label: "Won" },
    { value: "lost", label: "Lost" },
    { value: "on_hold", label: "On Hold" },
  ]},
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditOpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:edit")))
    redirect("/sales-crm");

  const { id } = await params;
  const record = await db
    .select()
    .from(scmOpportunities)
    .where(
      and(
        eq(scmOpportunities.id, id),
        eq(scmOpportunities.tenantId, session.tenantId),
        isNull(scmOpportunities.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    opportunityName: record.opportunityName,
    opportunityCode: record.opportunityCode ?? "",
    customerId: record.customerId,
    contactId: record.contactId ?? "",
    stageId: record.stageId ?? "",
    ownerId: record.ownerId,
    expectedRevenue: record.expectedRevenue ?? "",
    currency: record.currency ?? "",
    probability: record.probability ?? "",
    expectedTeu: record.expectedTeu ?? "",
    tradeLane: record.tradeLane ?? "",
    originPort: record.originPort ?? "",
    destinationPort: record.destinationPort ?? "",
    serviceType: record.serviceType ?? "",
    expectedCloseDate: record.expectedCloseDate ?? "",
    lostReason: record.lostReason ?? "",
    competitorName: record.competitorName ?? "",
    source: record.source ?? "",
    status: record.status,
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/sales-crm/opportunities/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Opportunity
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Opportunity"
          apiPath={`/api/v1/sales-crm/opportunities/${id}`}
          fields={OPPORTUNITY_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/sales-crm/opportunities/${id}`}
        />
      </div>
    </div>
  );
}
