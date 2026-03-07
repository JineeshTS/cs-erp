import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { melsComplianceRules } from "@/db/schema";
import { MelsForm } from "@/components/multi-entity-legal-structure/mels-form";
import type { FieldConfig } from "@/components/multi-entity-legal-structure/mels-form";
import { getCountryOptions } from "@/lib/lookups";

export default async function EditComplianceRulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:edit")))
    redirect("/multi-entity-legal-structure/compliance-rules");

  const countryOpts = await getCountryOptions();

  const FIELDS: FieldConfig[] = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "ruleCode", label: "Rule Code", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    {
      name: "country",
      label: "Country Code",
      type: "select", options: countryOpts,
      required: true,
    },
    { name: "region", label: "Region", type: "text" },
    { name: "regulatoryBody", label: "Regulatory Body", type: "text" },
    {
      name: "ruleType",
      label: "Rule Type",
      type: "select",
      options: [
        { value: "reporting", label: "Reporting" },
        { value: "filing", label: "Filing" },
        { value: "disclosure", label: "Disclosure" },
        { value: "audit", label: "Audit" },
        { value: "registration", label: "Registration" },
        { value: "other", label: "Other" },
      ],
    },
    { name: "frequency", label: "Frequency", type: "text" },
    { name: "isActive", label: "Active", type: "checkbox" },
  ];

  const [rule] = await db
    .select()
    .from(melsComplianceRules)
    .where(
      and(
        eq(melsComplianceRules.id, id),
        eq(melsComplianceRules.tenantId, session.tenantId),
        isNull(melsComplianceRules.deletedAt)
      )
    )
    .limit(1);

  if (!rule) notFound();

  const initialData: Record<string, unknown> = {
    name: rule.name,
    ruleCode: rule.ruleCode,
    description: rule.description ?? "",
    country: rule.country,
    region: rule.region ?? "",
    regulatoryBody: rule.regulatoryBody ?? "",
    ruleType: rule.ruleType,
    frequency: rule.frequency ?? "",
    isActive: rule.isActive,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/multi-entity-legal-structure/compliance-rules/${rule.id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Compliance Rule
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MelsForm
          entityType="Compliance Rule"
          apiPath={`/api/v1/multi-entity-legal-structure/compliance-rules/${rule.id}`}
          fields={FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/multi-entity-legal-structure/compliance-rules/${rule.id}`}
        />
      </div>
    </div>
  );
}
