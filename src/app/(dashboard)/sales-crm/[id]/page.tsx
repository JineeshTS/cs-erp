import Link from "next/link";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import {
  scmCustomers,
  scmCustomerContacts,
  scmOpportunities,
  scmRateQuotations,
  scmContracts,
  scmAccountPlans,
  scmOnboardingChecklists,
  scmLeads,
} from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DeleteButton } from "@/components/ui/delete-button";


const TABS = [
  { key: "overview", label: "Overview" },
  { key: "contacts", label: "Contacts" },
  { key: "opportunities", label: "Opportunities" },
  { key: "quotations", label: "Quotations" },
  { key: "contracts", label: "Contracts" },
  { key: "account-plans", label: "Account Plans" },
  { key: "onboarding", label: "Onboarding" },
  { key: "leads", label: "Leads" },
] as const;

function fmtDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "sales:read")))
    redirect("/sales-crm");

  const { id } = await params;
  const sp = await searchParams;
  const activeTab = sp.tab ?? "overview";

  const record = await db
    .select()
    .from(scmCustomers)
    .where(
      and(
        eq(scmCustomers.id, id),
        eq(scmCustomers.tenantId, session.tenantId),
        isNull(scmCustomers.deletedAt)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!record) notFound();

  const canEdit = await hasPermission(session.id, session.tenantId, "sales:edit");
  const canDelete = await hasPermission(session.id, session.tenantId, "sales:delete");

  const [
    contacts,
    opportunities,
    quotations,
    contracts,
    accountPlans,
    onboardingTasks,
    leads,
  ] = await Promise.all([
    db.select().from(scmCustomerContacts).where(and(eq(scmCustomerContacts.tenantId, session.tenantId), isNull(scmCustomerContacts.deletedAt), eq(scmCustomerContacts.customerId, id))).orderBy(desc(scmCustomerContacts.createdAt)).limit(50),
    db.select().from(scmOpportunities).where(and(eq(scmOpportunities.tenantId, session.tenantId), isNull(scmOpportunities.deletedAt), eq(scmOpportunities.customerId, id))).orderBy(desc(scmOpportunities.createdAt)).limit(50),
    db.select().from(scmRateQuotations).where(and(eq(scmRateQuotations.tenantId, session.tenantId), isNull(scmRateQuotations.deletedAt), eq(scmRateQuotations.customerId, id))).orderBy(desc(scmRateQuotations.createdAt)).limit(50),
    db.select().from(scmContracts).where(and(eq(scmContracts.tenantId, session.tenantId), isNull(scmContracts.deletedAt), eq(scmContracts.customerId, id))).orderBy(desc(scmContracts.createdAt)).limit(50),
    db.select().from(scmAccountPlans).where(and(eq(scmAccountPlans.tenantId, session.tenantId), isNull(scmAccountPlans.deletedAt), eq(scmAccountPlans.customerId, id))).orderBy(desc(scmAccountPlans.createdAt)).limit(50),
    db.select().from(scmOnboardingChecklists).where(and(eq(scmOnboardingChecklists.tenantId, session.tenantId), isNull(scmOnboardingChecklists.deletedAt), eq(scmOnboardingChecklists.customerId, id))).orderBy(desc(scmOnboardingChecklists.createdAt)).limit(50),
    db.select().from(scmLeads).where(and(eq(scmLeads.tenantId, session.tenantId), isNull(scmLeads.deletedAt), eq(scmLeads.convertedToCustomerId, id))).orderBy(desc(scmLeads.createdAt)).limit(50),
  ]);

  const tabData: Record<string, { headers: string[]; rows: string[][] }> = {
    contacts: {
      headers: ["Name", "Job Title", "Email", "Phone", "Primary"],
      rows: contacts.map((c) => [`${c.firstName} ${c.lastName}`, c.jobTitle ?? "-", c.email ?? "-", c.phone ?? "-", c.isPrimary ? "Yes" : "No"]),
    },
    opportunities: {
      headers: ["Name", "Trade Lane", "Revenue", "Probability", "Status"],
      rows: opportunities.map((o) => [o.opportunityName, o.tradeLane ?? "-", o.expectedRevenue?.toLocaleString() ?? "-", `${o.probability ?? 0}%`, o.status]),
    },
    quotations: {
      headers: ["Number", "Origin", "Destination", "Amount", "Status"],
      rows: quotations.map((q) => [q.quotationNumber, q.originPort, q.destinationPort, q.totalAmount?.toLocaleString() ?? "-", q.status]),
    },
    contracts: {
      headers: ["Number", "Name", "Type", "End Date", "Status"],
      rows: contracts.map((c) => [c.contractNumber, c.contractName, c.contractType.replace(/_/g, " "), fmtDate(c.endDate), c.status]),
    },
    "account-plans": {
      headers: ["Plan Name", "Fiscal Year", "Revenue Target", "TEU Target", "Status"],
      rows: accountPlans.map((a) => [a.planName, a.fiscalYear.toString(), a.revenueTargetAmount?.toLocaleString() ?? "-", a.teuTarget?.toLocaleString() ?? "-", a.status]),
    },
    onboarding: {
      headers: ["Task", "Category", "Due Date", "Required", "Status"],
      rows: onboardingTasks.map((t) => [t.taskName, t.taskCategory.replace(/_/g, " "), fmtDate(t.dueDate), t.isRequired ? "Yes" : "No", t.status]),
    },
    leads: {
      headers: ["Company", "Contact", "Source", "Score", "Status"],
      rows: leads.map((l) => [l.companyName, l.contactName, l.source.replace(/_/g, " "), l.qualificationScore?.toString() ?? "-", l.status]),
    },
  };

  const currentTab = tabData[activeTab];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/sales-crm"
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {record.companyName}
          </h1>
          <p className="text-sm text-gray-500">
            {record.customerCode} &mdash;{" "}
            {record.customerType.replace(/_/g, " ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/sales-crm/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          )}
          {canDelete && (
            <DeleteButton apiPath={`/api/v1/sales-crm/customers/${id}`} />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border bg-gray-50 p-1">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/sales-crm/${id}?tab=${tab.key}`}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" ? (
        <div className="rounded-lg border bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Customer Code", value: record.customerCode },
              { label: "Company Name", value: record.companyName },
              { label: "Trade Name", value: record.tradeName ?? "-" },
              { label: "Customer Type", value: record.customerType.replace(/_/g, " ") },
              { label: "Tier", value: record.tier ?? "standard" },
              { label: "Industry", value: record.industry ?? "-" },
              { label: "Country", value: record.country },
              { label: "City", value: record.city ?? "-" },
              { label: "Email", value: record.email ?? "-" },
              { label: "Phone", value: record.phone ?? "-" },
              { label: "Website", value: record.website ?? "-" },
              { label: "Tax Registration", value: record.taxRegistrationNo ?? "-" },
              { label: "Credit Limit", value: record.creditLimitAmount?.toLocaleString() ?? "-" },
              { label: "Credit Currency", value: record.creditCurrency ?? "-" },
              { label: "Payment Terms", value: record.paymentTermsDays ? `${record.paymentTermsDays} days` : "-" },
              { label: "Annual Revenue", value: record.annualRevenue?.toLocaleString() ?? "-" },
              { label: "Employees", value: record.employeeCount?.toLocaleString() ?? "-" },
              { label: "Status", value: record.status },
            ].map((field) => (
              <div key={field.label}>
                <p className="text-xs font-medium text-gray-500">
                  {field.label}
                </p>
                <p className="mt-0.5 text-sm text-gray-900">{field.value}</p>
              </div>
            ))}
          </div>
          {record.address && (
            <div className="mt-6 border-t pt-4">
              <p className="text-xs font-medium text-gray-500">Address</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                {record.address}
              </p>
            </div>
          )}
          {record.notes && (
            <div className="mt-4 border-t pt-4">
              <p className="text-xs font-medium text-gray-500">Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                {record.notes}
              </p>
            </div>
          )}
        </div>
      ) : currentTab ? (
        currentTab.rows.length === 0 ? (
          <div className="rounded-lg border bg-white px-8 py-12 text-center">
            <p className="text-gray-500">No records found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  {currentTab.headers.map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-start font-medium text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentTab.rows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-3 text-gray-600">
                        {j === row.length - 1 ? (
                          <Badge variant="secondary">
                            {String(cell).replace(/_/g, " ")}
                          </Badge>
                        ) : (
                          String(cell)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </div>
  );
}
