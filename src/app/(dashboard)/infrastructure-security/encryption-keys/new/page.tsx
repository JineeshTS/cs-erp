import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { IsfForm } from "@/components/infrastructure-security/isf-form";
import type { FieldConfig } from "@/components/infrastructure-security/isf-form";

const ENCRYPTION_KEY_FIELDS: FieldConfig[] = [
  {
    name: "keyName",
    label: "Key Name",
    type: "text",
    required: true,
    placeholder: "data-encryption-key-01",
  },
  {
    name: "keyCode",
    label: "Key Code",
    type: "text",
    required: true,
    placeholder: "DEK-01",
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
    placeholder: "256",
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
    placeholder: "90",
  },
  {
    name: "provider",
    label: "Provider",
    type: "text",
    placeholder: "aws-kms",
  },
  {
    name: "providerKeyId",
    label: "Provider Key ID",
    type: "text",
    placeholder: "arn:aws:kms:...",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Description of this encryption key...",
  },
];

export default async function NewEncryptionKeyPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "infra:create")))
    redirect("/infrastructure-security");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/infrastructure-security/encryption-keys"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          New Encryption Key
        </h1>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <IsfForm
          entityType="Encryption Key"
          apiPath="/api/v1/infrastructure-security/keys"
          fields={ENCRYPTION_KEY_FIELDS}
          returnPath="/infrastructure-security/encryption-keys"
        />
      </div>
    </div>
  );
}
