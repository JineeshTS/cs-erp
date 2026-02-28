import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CvmForm } from "@/components/chartering-vessel-management/cvm-form";
import type { FieldConfig } from "@/components/chartering-vessel-management/cvm-form";

const FIXTURE_FIELDS: FieldConfig[] = [
  { name: "fixtureReference", label: "Fixture Reference", type: "text", required: true },
  { name: "vesselName", label: "Vessel Name", type: "text" },
  { name: "fixtureType", label: "Fixture Type", type: "select", options: [
    { value: "voyage", label: "Voyage" },
    { value: "time_charter", label: "Time Charter" },
    { value: "bareboat", label: "Bareboat" },
    { value: "coa", label: "COA" },
  ]},
  { name: "counterpartyName", label: "Counterparty Name", type: "text", required: true },
  { name: "brokerName", label: "Broker Name", type: "text" },
  { name: "cargoType", label: "Cargo Type", type: "text" },
  { name: "cargoQuantity", label: "Cargo Quantity", type: "number" },
  { name: "laycanFrom", label: "Laycan From", type: "datetime-local" },
  { name: "laycanTo", label: "Laycan To", type: "datetime-local" },
  { name: "originPort", label: "Origin Port", type: "text" },
  { name: "destinationPort", label: "Destination Port", type: "text" },
  { name: "freightRate", label: "Freight Rate", type: "number" },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "commissionPercent", label: "Commission %", type: "number" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "open", label: "Open" },
    { value: "negotiating", label: "Negotiating" },
    { value: "fixed", label: "Fixed" },
    { value: "subjects", label: "Subjects" },
    { value: "failed", label: "Failed" },
    { value: "withdrawn", label: "Withdrawn" },
  ]},
  { name: "subjectDetails", label: "Subject Details", type: "textarea" },
  { name: "terms", label: "Terms", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewFixturePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:create")))
    redirect("/chartering-vessel-management");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/chartering-vessel-management/fixtures"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Fixture</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CvmForm
          entityType="Fixture"
          apiPath="/api/v1/chartering-vessel-management/fixtures"
          fields={FIXTURE_FIELDS}
          returnPath="/chartering-vessel-management/fixtures"
        />
      </div>
    </div>
  );
}
