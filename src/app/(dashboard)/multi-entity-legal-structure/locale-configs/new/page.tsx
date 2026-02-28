import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { MelsForm } from "@/components/multi-entity-legal-structure/mels-form";
import type { FieldConfig } from "@/components/multi-entity-legal-structure/mels-form";

const FIELDS: FieldConfig[] = [
  { name: "localeCode", label: "Locale Code", type: "text", required: true, placeholder: "en-US" },
  { name: "localeName", label: "Locale Name", type: "text", required: true },
  { name: "language", label: "Language", type: "text", required: true },
  {
    name: "direction",
    label: "Direction",
    type: "select",
    options: [
      { value: "ltr", label: "Left to Right" },
      { value: "rtl", label: "Right to Left" },
    ],
  },
  { name: "dateFormat", label: "Date Format", type: "text", placeholder: "DD/MM/YYYY" },
  { name: "numberFormat", label: "Number Format", type: "text", placeholder: "1,234.56" },
  { name: "isDefault", label: "Default Locale", type: "checkbox" },
  { name: "isActive", label: "Active", type: "checkbox" },
];

export default async function NewLocaleConfigPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    !(await hasPermission(session.id, session.tenantId, "entities:create"))
  )
    redirect("/multi-entity-legal-structure/locale-configs");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/multi-entity-legal-structure/locale-configs"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Locale Config
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MelsForm
          entityType="Locale Config"
          apiPath="/api/v1/multi-entity-legal-structure/locale-configs"
          fields={FIELDS}
          returnPath="/multi-entity-legal-structure/locale-configs"
        />
      </div>
    </div>
  );
}
