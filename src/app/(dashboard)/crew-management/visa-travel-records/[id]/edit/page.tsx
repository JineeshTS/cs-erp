import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getVisaTravelRecord } from "@/lib/crew-management/service";
import { CrmForm } from "@/components/crew-management/crm-form";
import type { FieldConfig } from "@/components/crew-management/crm-form";

const VISA_TRAVEL_FIELDS: FieldConfig[] = [
  {
    name: "crewMemberName",
    label: "Crew Member Name",
    type: "text",
    required: true,
  },
  { name: "nationality", label: "Nationality", type: "text" },
  {
    name: "recordType",
    label: "Record Type",
    type: "select",
    required: true,
    options: [
      { value: "visa", label: "Visa" },
      { value: "travel", label: "Travel" },
      { value: "repatriation", label: "Repatriation" },
    ],
  },
  { name: "visaType", label: "Visa Type", type: "text" },
  { name: "visaCountry", label: "Visa Country", type: "text" },
  { name: "visaNumber", label: "Visa Number", type: "text" },
  { name: "visaIssueDate", label: "Visa Issue Date", type: "datetime-local" },
  {
    name: "visaExpiryDate",
    label: "Visa Expiry Date",
    type: "datetime-local",
  },
  { name: "travelDate", label: "Travel Date", type: "datetime-local" },
  { name: "travelFrom", label: "Travel From", type: "text" },
  { name: "travelTo", label: "Travel To", type: "text" },
  { name: "flightNumber", label: "Flight Number", type: "text" },
  { name: "airline", label: "Airline", type: "text" },
  { name: "ticketCost", label: "Ticket Cost", type: "number" },
  { name: "currency", label: "Currency", type: "text" },
  { name: "repatriationReason", label: "Repatriation Reason", type: "text" },
  { name: "repatriationPort", label: "Repatriation Port", type: "text" },
  { name: "arrangedByName", label: "Arranged By", type: "text" },
  { name: "approvedByName", label: "Approved By", type: "text" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditVisaTravelRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "crew:edit")))
    redirect("/");

  const { id } = await params;
  const record = await getVisaTravelRecord(id, session.tenantId);
  if (!record) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/crew-management/visa-travel-records/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Visa &amp; Travel Record
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <CrmForm
          entityType="Visa & Travel Record"
          apiPath={`/api/v1/crew-management/visa-travel-records/${id}`}
          fields={VISA_TRAVEL_FIELDS}
          initialData={record as unknown as Record<string, unknown>}
          isEdit
          returnPath={`/crew-management/visa-travel-records/${id}`}
        />
      </div>
    </div>
  );
}
