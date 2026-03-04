import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { IcmForm, type FieldConfig } from "@/components/implementation-change-management/icm-form";

const UAT_FIELDS: FieldConfig[] = [
  { name: "uatType", label: "UAT Type", type: "select", required: true, options: [
    { value: "functional_test", label: "Functional Test" },
    { value: "integration_test", label: "Integration Test" },
    { value: "regression_test", label: "Regression Test" },
    { value: "performance_test", label: "Performance Test" },
    { value: "security_test", label: "Security Test" },
  ]},
  { name: "title", label: "Title", type: "text" },
  { name: "module", label: "Module", type: "text" },
  { name: "testCaseCount", label: "Test Case Count", type: "number" },
  { name: "passedCount", label: "Passed Count", type: "number" },
  { name: "failedCount", label: "Failed Count", type: "number" },
  { name: "blockedCount", label: "Blocked Count", type: "number" },
  { name: "testerName", label: "Tester Name", type: "text" },
  { name: "testStartDate", label: "Test Start Date", type: "datetime-local" },
  { name: "testEndDate", label: "Test End Date", type: "datetime-local" },
  { name: "signoffDate", label: "Signoff Date", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function NewUatManagementPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "icm:create")))
    redirect("/implementation-change-management/uat-managements");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/implementation-change-management/uat-managements" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New UAT</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <IcmForm entityType="UAT" apiPath="/api/v1/implementation-change-management/uat-managements" fields={UAT_FIELDS} returnPath="/implementation-change-management/uat-managements" />
      </div>
    </div>
  );
}
