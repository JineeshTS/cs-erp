import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { MdmForm } from "@/components/master-data-management/mdm-form";
import { getCountryOptions } from "@/lib/lookups";

export default async function NewPortPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "masterdata:create")))
    redirect("/master-data-management/ports");

  const countryOpts = await getCountryOptions();

  const PORT_FIELDS = [
    { name: "unLocode", label: "UN/LOCODE", type: "text" as const, required: true, placeholder: "e.g. AEJEA" },
    { name: "name", label: "Port Name", type: "text" as const, required: true },
    { name: "country", label: "Country Code", type: "select" as const, options: countryOpts, required: true },
    { name: "countryName", label: "Country Name", type: "text" as const },
    { name: "portType", label: "Port Type", type: "select" as const, options: [
      { value: "seaport", label: "Seaport" },
      { value: "airport", label: "Airport" },
      { value: "inland_port", label: "Inland Port" },
      { value: "dry_port", label: "Dry Port" },
    ]},
    { name: "timezone", label: "Timezone", type: "text" as const, placeholder: "e.g. Asia/Qatar" },
    { name: "latitude", label: "Latitude", type: "number" as const },
    { name: "longitude", label: "Longitude", type: "number" as const },
    { name: "isMajorPort", label: "Major Port", type: "checkbox" as const },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/master-data-management/ports"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Port</h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MdmForm
          entityType="Port"
          apiPath="/api/v1/master-data-management/ports"
          fields={PORT_FIELDS}
          returnPath="/master-data-management/ports"
        />
      </div>
    </div>
  );
}
