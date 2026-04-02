import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { ielCustomsFilings } from "@/db/schema";
import { IelForm } from "@/components/integration-edi-layer/iel-form";
import type { FieldConfig } from "@/components/integration-edi-layer/iel-form";
import { getPortOptions, getCurrencyOptions, getCountryOptions } from "@/lib/lookups";

export default async function EditCustomsFilingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "integration:edit")))
    redirect("/integration-edi-layer/customs-filings");

  const [portOpts, currencyOpts, countryOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getCurrencyOptions(),
    getCountryOptions(),
  ]);

  const FILING_FIELDS: FieldConfig[] = [
    {
      name: "filingType",
      label: "Filing Type",
      type: "select",
      required: true,
      options: [
        { value: "import_declaration", label: "Import Declaration" },
        { value: "export_declaration", label: "Export Declaration" },
        { value: "transit_declaration", label: "Transit Declaration" },
        { value: "re_export", label: "Re-Export" },
        { value: "temporary_import", label: "Temporary Import" },
        { value: "free_zone", label: "Free Zone" },
      ],
    },
    {
      name: "customsAuthority",
      label: "Customs Authority",
      type: "select",
      required: true,
      options: [
        { value: "qatar_customs", label: "Qatar Customs" },
        { value: "dubai_customs", label: "Dubai Customs" },
        { value: "abu_dhabi_customs", label: "Abu Dhabi Customs" },
        { value: "saudi_customs", label: "Saudi Customs" },
        { value: "india_customs", label: "India Customs" },
      ],
    },
    {
      name: "countryCode",
      label: "Country Code",
      type: "select", options: countryOpts,
      required: true,
    },
    {
      name: "portCode",
      label: "Port Code",
      type: "select", options: portOpts,
    },
    {
      name: "declarationType",
      label: "Declaration Type",
      type: "select",
      required: true,
      options: [
        { value: "standard", label: "Standard" },
        { value: "simplified", label: "Simplified" },
        { value: "pre_arrival", label: "Pre-Arrival" },
        { value: "post_clearance", label: "Post Clearance" },
      ],
    },
    {
      name: "hsCode",
      label: "HS Code",
      type: "text",
      placeholder: "8471.30",
    },
    {
      name: "totalValue",
      label: "Total Value",
      type: "number",
    },
    {
      name: "currency",
      label: "Currency",
      type: "select", options: currencyOpts,
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
    },
  ];

  const { id } = await params;

  const record = await db
    .select()
    .from(ielCustomsFilings)
    .where(
      and(
        eq(ielCustomsFilings.id, id),
        eq(ielCustomsFilings.tenantId, session.tenantId),
        isNull(ielCustomsFilings.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  if (record.status !== "draft") {
    redirect(`/integration-edi-layer/customs-filings/${id}`);
  }

  const initialData: Record<string, unknown> = {
    filingType: record.filingType,
    customsAuthority: record.customsAuthority,
    countryCode: record.countryCode,
    portCode: record.portCode ?? "",
    declarationType: record.declarationType,
    hsCode: record.hsCode ?? "",
    totalValue: record.totalValue ?? "",
    currency: record.currency ?? "USD",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/integration-edi-layer/customs-filings/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Customs Filing
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IelForm
          entityType="Customs Filing"
          apiPath={`/api/v1/integration-edi-layer/customs/filings/${id}`}
          fields={FILING_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/integration-edi-layer/customs-filings/${id}`}
        />
      </div>
    </div>
  );
}
