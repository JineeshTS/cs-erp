import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { OdmForm } from "@/components/operations-documentation/odm-form";
import type { FieldConfig } from "@/components/operations-documentation/odm-form";

const CONTAINER_FIELDS: FieldConfig[] = [
  { name: "blId", label: "BL ID", type: "text", required: true },
  { name: "containerNumber", label: "Container Number", type: "text", required: true, placeholder: "MSKU1234567" },
  { name: "sealNumber", label: "Seal Number", type: "text" },
  { name: "containerType", label: "Container Type", type: "text", placeholder: "GP" },
  { name: "containerSize", label: "Container Size", type: "text", placeholder: "40" },
  { name: "grossWeight", label: "Gross Weight", type: "number" },
  { name: "tareWeight", label: "Tare Weight", type: "number" },
  { name: "netWeight", label: "Net Weight", type: "number" },
  { name: "volumeCbm", label: "Volume (CBM)", type: "number" },
  { name: "packageCount", label: "Package Count", type: "number" },
  { name: "packageType", label: "Package Type", type: "text" },
  { name: "cargoDescription", label: "Cargo Description", type: "textarea" },
  { name: "hsCode", label: "HS Code", type: "text" },
];

export default async function NewBlContainerPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "operations:create")))
    redirect("/operations-documentation/bl-containers");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/operations-documentation/bl-containers" className="rounded-md p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New BL Container</h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <OdmForm
          entityType="BL Container"
          apiPath="/api/v1/operations-documentation/bl-containers"
          fields={CONTAINER_FIELDS}
          returnPath="/operations-documentation/bl-containers"
        />
      </div>
    </div>
  );
}
