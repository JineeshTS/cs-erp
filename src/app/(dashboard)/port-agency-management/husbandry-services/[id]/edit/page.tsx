import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getHusbandryService } from "@/lib/port-agency-management/service";
import { PamForm } from "@/components/port-agency-management/pam-form";
import type { FieldConfig } from "@/components/port-agency-management/pam-form";
import { getPortOptions, getVesselOptions, getCustomerOptions, getCurrencyOptions } from "@/lib/lookups";

export default async function EditHusbandryServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "port_agency:edit")))
    redirect("/port-agency-management/husbandry-services");

  const [portOpts, vesselOpts, customerOpts, currencyOpts] = await Promise.all([
    getPortOptions(session.tenantId),
    getVesselOptions(session.tenantId),
    getCustomerOptions(session.tenantId),
    getCurrencyOptions(),
  ]);

  const HUSBANDRY_SERVICE_FIELDS: FieldConfig[] = [
    {
      name: "serviceType",
      label: "Service Type",
      type: "select",
      required: true,
      options: [
        { value: "provisions", label: "Provisions" },
        { value: "medical", label: "Medical" },
        { value: "repairs", label: "Repairs" },
        { value: "stores", label: "Stores" },
        { value: "crew_welfare", label: "Crew Welfare" },
        { value: "launch_service", label: "Launch Service" },
        { value: "garbage_removal", label: "Garbage Removal" },
        { value: "fresh_water", label: "Fresh Water" },
      ],
    },
    { name: "vesselName", label: "Vessel Name", type: "select", options: vesselOpts, required: true },
    { name: "imoNumber", label: "IMO Number", type: "text" },
    { name: "portCallRef", label: "Port Call Ref", type: "text" },
    { name: "portName", label: "Port Name", type: "select", options: portOpts },
    { name: "supplierName", label: "Supplier Name", type: "select", options: customerOpts },
    { name: "supplierContact", label: "Supplier Contact", type: "text" },
    { name: "supplierPhone", label: "Supplier Phone", type: "text" },
    { name: "requestedDate", label: "Requested Date", type: "datetime-local" },
    { name: "deliveryDate", label: "Delivery Date", type: "datetime-local" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "quantity", label: "Quantity", type: "number" },
    { name: "unit", label: "Unit", type: "text" },
    { name: "estimatedCost", label: "Estimated Cost", type: "number" },
    { name: "actualCost", label: "Actual Cost", type: "number" },
    { name: "currency", label: "Currency", type: "select", options: currencyOpts },
    { name: "invoiceRef", label: "Invoice Ref", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const { id } = await params;

  const svc = await getHusbandryService(id, session.tenantId);
  if (!svc) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/port-agency-management/husbandry-services/${id}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Husbandry Service
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <PamForm
          entityType="Husbandry Service"
          apiPath={`/api/v1/port-agency-management/husbandry-services/${id}`}
          fields={HUSBANDRY_SERVICE_FIELDS}
          initialData={{
            serviceType: svc.serviceType,
            vesselName: svc.vesselName,
            imoNumber: svc.imoNumber ?? "",
            portCallRef: svc.portCallRef ?? "",
            portName: svc.portName ?? "",
            supplierName: svc.supplierName ?? "",
            supplierContact: svc.supplierContact ?? "",
            supplierPhone: svc.supplierPhone ?? "",
            requestedDate: svc.requestedDate
              ? new Date(svc.requestedDate).toISOString()
              : "",
            deliveryDate: svc.deliveryDate
              ? new Date(svc.deliveryDate).toISOString()
              : "",
            description: svc.description ?? "",
            quantity: svc.quantity ?? "",
            unit: svc.unit ?? "",
            estimatedCost: svc.estimatedCost ?? "",
            actualCost: svc.actualCost ?? "",
            currency: svc.currency ?? "",
            invoiceRef: svc.invoiceRef ?? "",
            notes: svc.notes ?? "",
          }}
          isEdit
          returnPath={`/port-agency-management/husbandry-services/${id}`}
        />
      </div>
    </div>
  );
}
