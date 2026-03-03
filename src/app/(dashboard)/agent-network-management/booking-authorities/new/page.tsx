import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { AnmForm } from "@/components/agent-network-management/anm-form";
import type { FieldConfig } from "@/components/agent-network-management/anm-form";

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
  { name: "agentName", label: "Agent Name", type: "text" },
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

export default async function NewBookingAuthorityPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "anm:create")))
    redirect("/agent-network-management/booking-authorities");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/agent-network-management/booking-authorities"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to Booking Authorities
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">New Booking Authority</h1>
      </div>

      <AnmForm
        entityType="Booking Authority"
        apiPath="/api/v1/agent-network-management/booking-authorities"
        fields={fields}
        returnPath="/agent-network-management/booking-authorities"
      />
    </div>
  );
}
