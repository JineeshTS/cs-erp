import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { odmRegulatoryFilings } from "@/db/schema";
import { OdmForm } from "@/components/operations-documentation/odm-form";
import type { FieldConfig } from "@/components/operations-documentation/odm-form";
import { getPortOptions, getVesselOptions, getCountryOptions } from "@/lib/lookups";

export default async function EditRegulatoryFilingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "operations:edit")))
    redirect("/operations-documentation");

  const [portOpts, vesselOpts, countryOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
    getCountryOptions(),
  ]);

  const FILING_FIELDS: FieldConfig[] = [
    { name: "filingReference", label: "Filing Reference", type: "text", required: true },
    { name: "filingType", label: "Filing Type", type: "select", required: true, options: [
      { value: "ams", label: "AMS" },
      { value: "isf", label: "ISF" },
      { value: "ics2", label: "ICS2" },
      { value: "ens", label: "ENS" },
      { value: "edi", label: "EDI" },
      { value: "customs_entry", label: "Customs Entry" },
    ]},
    { name: "regulatoryBody", label: "Regulatory Body", type: "text", required: true },
    { name: "country", label: "Country", type: "select", options: countryOpts, required: true },
    { name: "blNumber", label: "BL Number", type: "text" },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts },
    { name: "voyageNumber", label: "Voyage Number", type: "text" },
    { name: "portOfLoading", label: "Port of Loading", type: "select", options: portOpts },
    { name: "portOfDischarge", label: "Port of Discharge", type: "select", options: portOpts },
    { name: "filingDeadline", label: "Filing Deadline", type: "datetime-local" },
    { name: "status", label: "Status", type: "select", options: [
      { value: "pending", label: "Pending" },
      { value: "filed", label: "Filed" },
      { value: "accepted", label: "Accepted" },
      { value: "rejected", label: "Rejected" },
      { value: "amended", label: "Amended" },
      { value: "cancelled", label: "Cancelled" },
    ]},
    { name: "shipperName", label: "Shipper Name", type: "text" },
    { name: "consigneeName", label: "Consignee Name", type: "text" },
    { name: "hsCode", label: "HS Code", type: "text" },
    { name: "containerNumber", label: "Container Number", type: "text" },
    { name: "grossWeight", label: "Gross Weight", type: "number" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;
  const record = await db
    .select()
    .from(odmRegulatoryFilings)
    .where(
      and(
        eq(odmRegulatoryFilings.id, id),
        eq(odmRegulatoryFilings.tenantId, session.tenantId),
        isNull(odmRegulatoryFilings.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    filingReference: record.filingReference,
    filingType: record.filingType,
    regulatoryBody: record.regulatoryBody,
    country: record.country,
    blNumber: record.blNumber ?? "",
    vesselName: record.vesselName ?? "",
    voyageNumber: record.voyageNumber ?? "",
    portOfLoading: record.portOfLoading ?? "",
    portOfDischarge: record.portOfDischarge ?? "",
    filingDeadline: record.filingDeadline
      ? record.filingDeadline.toISOString()
      : "",
    status: record.status,
    shipperName: record.shipperName ?? "",
    consigneeName: record.consigneeName ?? "",
    hsCode: record.hsCode ?? "",
    containerNumber: record.containerNumber ?? "",
    grossWeight: record.grossWeight ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/operations-documentation/regulatory-filings/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Regulatory Filing
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <OdmForm
          entityType="Regulatory Filing"
          apiPath={`/api/v1/operations-documentation/regulatory-filings/${id}`}
          fields={FILING_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/operations-documentation/regulatory-filings/${id}`}
        />
      </div>
    </div>
  );
}
