import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { ScmForm } from "@/components/sales-crm/scm-form";
import type { FieldConfig } from "@/components/sales-crm/scm-form";

const SEGMENT_FIELDS: FieldConfig[] = [
  { name: "segmentName", label: "Segment Name", type: "text", required: true },
  { name: "segmentCode", label: "Segment Code", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "color", label: "Color", type: "text", placeholder: "#FF0000" },
  { name: "sortOrder", label: "Sort Order", type: "number" },
  { name: "isActive", label: "Active", type: "checkbox" },
];

export default async function NewCustomerSegmentPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:create")))
    redirect("/sales-crm");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/sales-crm/customer-segments"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Segment
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <ScmForm
          entityType="Segment"
          apiPath="/api/v1/sales-crm/customer-segments"
          fields={SEGMENT_FIELDS}
          returnPath="/sales-crm/customer-segments"
        />
      </div>
    </div>
  );
}
