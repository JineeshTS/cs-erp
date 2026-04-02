import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getBookingAuthority } from "@/lib/agent-network-management/service";
import { AnmForm } from "@/components/agent-network-management/anm-form";
import type { FieldConfig } from "@/components/agent-network-management/anm-form";
import { getCustomerOptions } from "@/lib/lookups";

export default async function EditBookingAuthorityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "anm:edit")))
    redirect("/agent-network-management/booking-authorities");

  const customerOpts = await getCustomerOptions(session.tenantId);

  const fields: FieldConfig[] = [
    {
      name: "authorityType",
      label: "Authority Type",
      type: "select",
      required: true,
      options: [
        { value: "full_authority", label: "Full Authority" },
        { value: "limited_authority", label: "Limited Authority" },
        { value: "quote_only", label: "Quote Only" },
        { value: "approval_required", label: "Approval Required" },
        { value: "emergency_authority", label: "Emergency Authority" },
      ],
    },
    { name: "agentName", label: "Agent Name", type: "select", options: customerOpts },
    { name: "agentCode", label: "Agent Code", type: "text" },
    { name: "tradeRoute", label: "Trade Route", type: "text" },
    { name: "maxBookingValue", label: "Max Booking Value", type: "text" },
    { name: "maxDiscountPct", label: "Max Discount %", type: "text" },
    { name: "authorityCurrency", label: "Currency", type: "text" },
    { name: "containerTypes", label: "Container Types", type: "textarea" },
    { name: "approvalThreshold", label: "Approval Threshold", type: "text" },
    { name: "escalationContact", label: "Escalation Contact", type: "text" },
    { name: "effectiveFrom", label: "Effective From", type: "datetime-local" },
    { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;
  const record = await getBookingAuthority(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/agent-network-management/booking-authorities/${record.id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to {record.authorityRef}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">
          Edit {record.authorityRef}
        </h1>
      </div>

      <AnmForm
        entityType="Booking Authority"
        apiPath={`/api/v1/agent-network-management/booking-authorities/${record.id}`}
        fields={fields}
        initialData={{
          authorityType: record.authorityType,
          agentName: record.agentName ?? "",
          agentCode: record.agentCode ?? "",
          tradeRoute: record.tradeRoute ?? "",
          maxBookingValue: record.maxBookingValue ?? "",
          maxDiscountPct: record.maxDiscountPct ?? "",
          authorityCurrency: record.authorityCurrency ?? "",
          containerTypes: record.containerTypes ?? "",
          approvalThreshold: record.approvalThreshold ?? "",
          escalationContact: record.escalationContact ?? "",
          effectiveFrom: record.effectiveFrom
            ? new Date(record.effectiveFrom).toISOString().slice(0, 16)
            : "",
          effectiveTo: record.effectiveTo
            ? new Date(record.effectiveTo).toISOString().slice(0, 16)
            : "",
          notes: record.notes ?? "",
        }}
        isEdit
        returnPath={`/agent-network-management/booking-authorities/${record.id}`}
        method="PATCH"
      />
    </div>
  );
}
