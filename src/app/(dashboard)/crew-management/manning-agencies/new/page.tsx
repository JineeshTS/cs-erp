import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { CrmForm } from "@/components/crew-management/crm-form";
import type { FieldConfig } from "@/components/crew-management/crm-form";
import { getCountryOptions } from "@/lib/lookups";

export default async function NewManningAgencyPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "crew:create")))
    redirect("/");

  const countryOpts = await getCountryOptions();

  const MANNING_AGENCY_FIELDS: FieldConfig[] = [
    { name: "agencyName", label: "Agency Name", type: "text", required: true },
    { name: "country", label: "Country", type: "select", options: countryOpts, required: true },
    { name: "city", label: "City", type: "text" },
    { name: "address", label: "Address", type: "textarea" },
    { name: "contactPerson", label: "Contact Person", type: "text" },
    { name: "contactEmail", label: "Contact Email", type: "text" },
    { name: "contactPhone", label: "Contact Phone", type: "text" },
    { name: "licenseNumber", label: "License Number", type: "text" },
    { name: "licenseExpiry", label: "License Expiry", type: "datetime-local" },
    { name: "activeCrewCount", label: "Active Crew Count", type: "number" },
    { name: "performanceRating", label: "Performance Rating", type: "number" },
    {
      name: "contractStartDate",
      label: "Contract Start Date",
      type: "datetime-local",
    },
    {
      name: "contractEndDate",
      label: "Contract End Date",
      type: "datetime-local",
    },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/crew-management/manning-agencies"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Manning Agency
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CrmForm
          entityType="Manning Agency"
          apiPath="/api/v1/crew-management/manning-agencies"
          fields={MANNING_AGENCY_FIELDS}
          returnPath="/crew-management/manning-agencies"
        />
      </div>
    </div>
  );
}
