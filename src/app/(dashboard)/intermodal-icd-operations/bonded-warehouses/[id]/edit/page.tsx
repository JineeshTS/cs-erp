import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getBondedWarehouse } from "@/lib/intermodal-icd-operations/service";
import { IcdForm } from "@/components/intermodal-icd-operations/icd-form";
import type { FieldConfig } from "@/components/intermodal-icd-operations/icd-form";
import { getCurrencyOptions } from "@/lib/lookups";

export default async function EditBondedWarehousePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "intermodal:edit")))
    redirect("/intermodal-icd-operations/bonded-warehouses");

  const currencyOpts = await getCurrencyOptions();

  const FIELDS: FieldConfig[] = [
    { name: "warehouseName", label: "Warehouse Name", type: "text", required: true },
    { name: "warehouseCode", label: "Warehouse Code", type: "text" },
    {
      name: "warehouseType",
      label: "Warehouse Type",
      type: "select",
      required: true,
      options: [
        { value: "bonded", label: "Bonded" },
        { value: "free_zone", label: "Free Zone" },
        { value: "general", label: "General" },
        { value: "temperature_controlled", label: "Temp Controlled" },
      ],
    },
    { name: "customsLicenseNumber", label: "Customs License #", type: "text" },
    { name: "customsLicenseExpiry", label: "License Expiry", type: "datetime-local" },
    { name: "location", label: "Location", type: "text" },
    { name: "totalAreaSqm", label: "Total Area (sqm)", type: "text" },
    { name: "usableAreaSqm", label: "Usable Area (sqm)", type: "text" },
    { name: "storageCapacityTeu", label: "Storage Capacity (TEU)", type: "number" },
    { name: "currentOccupancyTeu", label: "Current Occupancy (TEU)", type: "number" },
    { name: "temperatureControlled", label: "Temperature Controlled", type: "checkbox" },
    { name: "tempRangeMin", label: "Temp Range Min", type: "text" },
    { name: "tempRangeMax", label: "Temp Range Max", type: "text" },
    { name: "hazmatCertified", label: "Hazmat Certified", type: "checkbox" },
    {
      name: "securityLevel",
      label: "Security Level",
      type: "select",
      options: [
        { value: "basic", label: "Basic" },
        { value: "enhanced", label: "Enhanced" },
        { value: "high", label: "High" },
      ],
    },
    { name: "operatingHoursStart", label: "Operating Hours Start", type: "text", placeholder: "06:00" },
    { name: "operatingHoursEnd", label: "Operating Hours End", type: "text", placeholder: "22:00" },
    { name: "bondPeriodDays", label: "Bond Period (days)", type: "number" },
    { name: "dailyStorageRate", label: "Daily Storage Rate", type: "text" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "contactName", label: "Contact Name", type: "text" },
    { name: "contactPhone", label: "Contact Phone", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const record = await getBondedWarehouse(id, session.tenantId);
  if (!record) notFound();

  const initialData: Record<string, unknown> = {
    warehouseName: record.warehouseName ?? "",
    warehouseCode: record.warehouseCode ?? "",
    warehouseType: record.warehouseType ?? "",
    customsLicenseNumber: record.customsLicenseNumber ?? "",
    customsLicenseExpiry: record.customsLicenseExpiry
      ? new Date(record.customsLicenseExpiry).toISOString()
      : "",
    location: record.location ?? "",
    totalAreaSqm: record.totalAreaSqm ?? "",
    usableAreaSqm: record.usableAreaSqm ?? "",
    storageCapacityTeu: record.storageCapacityTeu ?? "",
    currentOccupancyTeu: record.currentOccupancyTeu ?? "",
    temperatureControlled: record.temperatureControlled ?? false,
    tempRangeMin: record.tempRangeMin ?? "",
    tempRangeMax: record.tempRangeMax ?? "",
    hazmatCertified: record.hazmatCertified ?? false,
    securityLevel: record.securityLevel ?? "",
    operatingHoursStart: record.operatingHoursStart ?? "",
    operatingHoursEnd: record.operatingHoursEnd ?? "",
    bondPeriodDays: record.bondPeriodDays ?? "",
    dailyStorageRate: record.dailyStorageRate ?? "",
    currency: record.currency ?? "",
    contactName: record.contactName ?? "",
    contactPhone: record.contactPhone ?? "",
    notes: record.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/intermodal-icd-operations/bonded-warehouses/${record.id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Bonded Warehouse
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <IcdForm
          entityType="Bonded Warehouse"
          apiPath={`/api/v1/intermodal-icd-operations/bonded-warehouses/${record.id}`}
          fields={FIELDS}
          initialData={initialData}
          isEdit
          returnPath={`/intermodal-icd-operations/bonded-warehouses/${record.id}`}
        />
      </div>
    </div>
  );
}
