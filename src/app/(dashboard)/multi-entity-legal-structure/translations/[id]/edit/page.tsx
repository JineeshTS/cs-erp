import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { melsTranslations } from "@/db/schema";
import { MelsForm } from "@/components/multi-entity-legal-structure/mels-form";
import type { FieldConfig } from "@/components/multi-entity-legal-structure/mels-form";

const FIELDS: FieldConfig[] = [
  { name: "localeCode", label: "Locale Code", type: "text", required: true, placeholder: "en-US" },
  { name: "namespace", label: "Namespace", type: "text", required: true, placeholder: "common" },
  { name: "key", label: "Key", type: "text", required: true },
  { name: "value", label: "Value", type: "textarea", required: true },
  { name: "isVerified", label: "Verified", type: "checkbox" },
];

export default async function EditTranslationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "entities:edit")))
    redirect("/multi-entity-legal-structure/translations");

  const { id } = await params;

  const translation = await db
    .select()
    .from(melsTranslations)
    .where(
      and(
        eq(melsTranslations.id, id),
        eq(melsTranslations.tenantId, session.tenantId),
        isNull(melsTranslations.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!translation) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/multi-entity-legal-structure/translations/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Translation
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <MelsForm
          entityType="Translation"
          apiPath={`/api/v1/multi-entity-legal-structure/translations/${id}`}
          fields={FIELDS}
          initialData={{
            localeCode: translation.localeCode,
            namespace: translation.namespace,
            key: translation.key,
            value: translation.value,
            isVerified: translation.isVerified,
          }}
          isEdit
          returnPath={`/multi-entity-legal-structure/translations/${id}`}
        />
      </div>
    </div>
  );
}
