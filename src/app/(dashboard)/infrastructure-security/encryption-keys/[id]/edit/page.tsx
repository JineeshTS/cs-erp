import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { isfEncryptionKeys } from "@/db/schema";
import { IsfForm } from "@/components/infrastructure-security/isf-form";
import type { FieldConfig } from "@/components/infrastructure-security/isf-form";

const ENCRYPTION_KEY_FIELDS: FieldConfig[] = [
  {
    name: "keyName",
    label: "Key Name",
    type: "text",
    required: true,
  },
  {
    name: "keyCode",
    label: "Key Code",
    type: "text",
    required: true,
  },
  {
    name: "keyType",
    label: "Key Type",
    type: "select",
    required: true,
    options: [
      { value: "symmetric", label: "Symmetric" },
      { value: "asymmetric", label: "Asymmetric" },
      { value: "hmac", label: "HMAC" },
      { value: "kek", label: "KEK (Key Encryption Key)" },
    ],
  },
  {
    name: "algorithm",
    label: "Algorithm",
    type: "select",
    required: true,
    options: [
      { value: "AES-256-GCM", label: "AES-256-GCM" },
      { value: "RSA-2048", label: "RSA-2048" },
      { value: "RSA-4096", label: "RSA-4096" },
      { value: "ECDSA-P256", label: "ECDSA-P256" },
      { value: "HMAC-SHA256", label: "HMAC-SHA256" },
    ],
  },
  {
    name: "keySize",
    label: "Key Size (bits)",
    type: "number",
    required: true,
  },
  {
    name: "purpose",
    label: "Purpose",
    type: "select",
    required: true,
    options: [
      { value: "data_encryption", label: "Data Encryption" },
      { value: "key_wrapping", label: "Key Wrapping" },
      { value: "signing", label: "Signing" },
      { value: "authentication", label: "Authentication" },
      { value: "tokenization", label: "Tokenization" },
    ],
  },
  {
    name: "autoRotateIntervalDays",
    label: "Auto-Rotate Interval (days)",
    type: "number",
  },
  {
    name: "provider",
    label: "Provider",
    type: "text",
  },
  {
    name: "providerKeyId",
    label: "Provider Key ID",
    type: "text",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
  },
];

export default async function EditEncryptionKeyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "infra:edit")))
    redirect("/infrastructure-security");

  const { id } = await params;

  const record = await db
    .select()
    .from(isfEncryptionKeys)
    .where(
      and(
        eq(isfEncryptionKeys.id, id),
        eq(isfEncryptionKeys.tenantId, session.tenantId),
        isNull(isfEncryptionKeys.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    keyName: record.keyName,
    keyCode: record.keyCode,
    keyType: record.keyType,
    algorithm: record.algorithm,
    keySize: record.keySize,
    purpose: record.purpose,
    autoRotateIntervalDays: record.autoRotateIntervalDays ?? "",
    provider: record.provider ?? "",
    providerKeyId: record.providerKeyId ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/infrastructure-security/encryption-keys/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Encryption Key
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <IsfForm
          entityType="Encryption Key"
          apiPath={`/api/v1/infrastructure-security/keys/${id}`}
          fields={ENCRYPTION_KEY_FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/infrastructure-security/encryption-keys/${id}`}
        />
      </div>
    </div>
  );
}
