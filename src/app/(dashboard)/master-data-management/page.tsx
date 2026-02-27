import Link from "next/link";
import {
  Anchor,
  Ship,
  Package,
  Box,
  Users,
  Receipt,
  ArrowLeftRight,
  Landmark,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { db } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import {
  ports,
  vessels,
  commodities,
  containerTypes,
  customers,
  tariffCodes,
  exchangeRates,
  glAccounts,
} from "@/db/schema";

const MDM_SECTIONS = [
  {
    key: "ports",
    label: "Ports & Terminals",
    description: "Manage port and terminal master data",
    icon: Anchor,
    href: "/master-data-management/ports",
    permission: "vessels:read",
  },
  {
    key: "vessels",
    label: "Vessel Registry",
    description: "Vessel particulars and registry",
    icon: Ship,
    href: "/master-data-management/vessels",
    permission: "vessels:read",
  },
  {
    key: "commodities",
    label: "Commodities & HS Codes",
    description: "Commodity and HS code master data",
    icon: Package,
    href: "/master-data-management/commodities",
    permission: "vessels:read",
  },
  {
    key: "containerTypes",
    label: "Container Types",
    description: "Container ISO codes and specifications",
    icon: Box,
    href: "/master-data-management/container-types",
    permission: "containers:read",
  },
  {
    key: "customers",
    label: "Customers & Agents",
    description: "Customer and agent hierarchy",
    icon: Users,
    href: "/master-data-management/customers",
    permission: "bookings:read",
  },
  {
    key: "tariffs",
    label: "Freight Tariffs",
    description: "Freight tariff code master",
    icon: Receipt,
    href: "/master-data-management/tariffs",
    permission: "finance:read",
  },
  {
    key: "exchangeRates",
    label: "Exchange Rates",
    description: "Currency exchange rate management",
    icon: ArrowLeftRight,
    href: "/master-data-management/exchange-rates",
    permission: "finance:read",
  },
  {
    key: "glAccounts",
    label: "GL Accounts & Cost Centres",
    description: "Chart of accounts and cost centres",
    icon: Landmark,
    href: "/master-data-management/gl-accounts",
    permission: "finance:read",
  },
];

export default async function MasterDataManagementPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const counts = await Promise.all([
    db.select().from(ports).where(and(eq(ports.tenantId, session.tenantId), isNull(ports.deletedAt))),
    db.select().from(vessels).where(and(eq(vessels.tenantId, session.tenantId), isNull(vessels.deletedAt))),
    db.select().from(commodities).where(and(eq(commodities.tenantId, session.tenantId), isNull(commodities.deletedAt))),
    db.select().from(containerTypes).where(and(eq(containerTypes.tenantId, session.tenantId), isNull(containerTypes.deletedAt))),
    db.select().from(customers).where(and(eq(customers.tenantId, session.tenantId), isNull(customers.deletedAt))),
    db.select().from(tariffCodes).where(and(eq(tariffCodes.tenantId, session.tenantId), isNull(tariffCodes.deletedAt))),
    db.select().from(exchangeRates).where(and(eq(exchangeRates.tenantId, session.tenantId), isNull(exchangeRates.deletedAt))),
    db.select().from(glAccounts).where(and(eq(glAccounts.tenantId, session.tenantId), isNull(glAccounts.deletedAt))),
  ]);

  const countMap: Record<string, number> = {
    ports: counts[0].length,
    vessels: counts[1].length,
    commodities: counts[2].length,
    containerTypes: counts[3].length,
    customers: counts[4].length,
    tariffs: counts[5].length,
    exchangeRates: counts[6].length,
    glAccounts: counts[7].length,
  };

  const visibleSections = [];
  for (const section of MDM_SECTIONS) {
    if (await hasPermission(session.id, session.tenantId, section.permission)) {
      visibleSections.push(section);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Master Data Management
        </h1>
        <p className="text-sm text-gray-500">
          Manage reference data used across the ERP system
        </p>
      </div>

      {visibleSections.length === 0 ? (
        <div className="rounded-lg border bg-white px-8 py-12 text-center">
          <p className="text-gray-500">
            You don&apos;t have permission to view any master data sections.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleSections.map((section) => {
            const Icon = section.icon;
            const count = countMap[section.key] ?? 0;
            return (
              <Link
                key={section.key}
                href={section.href}
                className="group rounded-lg border bg-white p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600 group-hover:bg-blue-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {count}
                  </span>
                </div>
                <h3 className="mt-3 font-semibold text-gray-900">
                  {section.label}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {section.description}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
