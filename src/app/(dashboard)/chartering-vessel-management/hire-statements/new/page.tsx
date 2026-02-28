import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { CvmForm } from "@/components/chartering-vessel-management/cvm-form";
import type { FieldConfig } from "@/components/chartering-vessel-management/cvm-form";

const HS_FIELDS: FieldConfig[] = [
  { name: "charterPartyId", label: "Charter Party ID", type: "text", required: true, placeholder: "UUID" },
  { name: "statementNumber", label: "Statement Number", type: "text", required: true },
  { name: "periodFrom", label: "Period From", type: "datetime-local", required: true },
  { name: "periodTo", label: "Period To", type: "datetime-local", required: true },
  { name: "hireDays", label: "Hire Days", type: "number", required: true },
  { name: "hireRate", label: "Hire Rate", type: "number", required: true },
  { name: "grossHire", label: "Gross Hire", type: "number", required: true },
  { name: "offHireDeductions", label: "Off-Hire Deductions", type: "number" },
  { name: "bunkerAdjustments", label: "Bunker Adjustments", type: "number" },
  { name: "otherDeductions", label: "Other Deductions", type: "number" },
  { name: "netHire", label: "Net Hire", type: "number", required: true },
  { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewHireStatementPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "chartering:create")))
    redirect("/chartering-vessel-management");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/chartering-vessel-management/hire-statements"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Hire Statement
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CvmForm
          entityType="Hire Statement"
          apiPath="/api/v1/chartering-vessel-management/hire-statements"
          fields={HS_FIELDS}
          returnPath="/chartering-vessel-management/hire-statements"
        />
      </div>
    </div>
  );
}
