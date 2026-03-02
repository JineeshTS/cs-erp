import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getAllianceAgreement } from "@/lib/liner-trade-route-management/service";
import { LtrForm } from "@/components/liner-trade-route-management/ltr-form";
import type { FieldConfig } from "@/components/liner-trade-route-management/ltr-form";

const ALLIANCE_AGREEMENT_FIELDS: FieldConfig[] = [
  { name: "allianceName", label: "Alliance Name", type: "text", required: true },
  {
    name: "allianceType",
    label: "Alliance Type",
    type: "select",
    required: true,
    options: [
      { value: "global_alliance", label: "Global Alliance" },
      { value: "regional_alliance", label: "Regional Alliance" },
      { value: "bilateral", label: "Bilateral" },
      { value: "consortium", label: "Consortium" },
    ],
  },
  { name: "memberCount", label: "Member Count", type: "number", required: true },
  { name: "totalDeployedTeu", label: "Total Deployed TEU", type: "number" },
  {
    name: "vesselSharingArrangement",
    label: "Vessel Sharing Arrangement",
    type: "textarea",
  },
  { name: "jointServiceCount", label: "Joint Service Count", type: "number" },
  { name: "governanceStructure", label: "Governance Structure", type: "textarea" },
  { name: "meetingSchedule", label: "Meeting Schedule", type: "text" },
  {
    name: "effectiveFrom",
    label: "Effective From",
    type: "datetime-local",
    required: true,
  },
  { name: "effectiveTo", label: "Effective To", type: "datetime-local" },
  { name: "regulatoryApproval", label: "Regulatory Approval", type: "checkbox" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default async function EditAllianceAgreementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "liner:edit")))
    redirect("/liner-trade-route-management/alliance-agreements");

  const { id } = await params;

  const agreement = await getAllianceAgreement(id, session.tenantId);
  if (!agreement) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/liner-trade-route-management/alliance-agreements/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Alliance Agreement
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <LtrForm
          entityType="Alliance Agreement"
          apiPath={`/api/v1/liner-trade-route-management/alliance-agreements/${id}`}
          fields={ALLIANCE_AGREEMENT_FIELDS}
          initialData={{
            allianceName: agreement.allianceName,
            allianceType: agreement.allianceType,
            memberCount: agreement.memberCount,
            totalDeployedTeu: agreement.totalDeployedTeu ?? "",
            vesselSharingArrangement:
              agreement.vesselSharingArrangement ?? "",
            jointServiceCount: agreement.jointServiceCount ?? "",
            governanceStructure: agreement.governanceStructure ?? "",
            meetingSchedule: agreement.meetingSchedule ?? "",
            effectiveFrom: agreement.effectiveFrom
              ? new Date(agreement.effectiveFrom).toISOString()
              : "",
            effectiveTo: agreement.effectiveTo
              ? new Date(agreement.effectiveTo).toISOString()
              : "",
            regulatoryApproval: agreement.regulatoryApproval,
            notes: agreement.notes ?? "",
            memberCarriers: agreement.memberCarriers ?? [],
          }}
          isEdit
          returnPath={`/liner-trade-route-management/alliance-agreements/${id}`}
        />
      </div>
    </div>
  );
}
