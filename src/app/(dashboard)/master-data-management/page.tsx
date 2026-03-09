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
  Building2,
  DollarSign,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";
import { getMdmOverview } from "@/lib/master-data-management/service";

const MDM_SECTIONS = [
  {
    key: "ports",
    label: "Ports",
    description: "Manage port master data",
    icon: Anchor,
    href: "/master-data-management/ports",
  },
  {
    key: "terminals",
    label: "Terminals",
    description: "Port terminal facilities",
    icon: Building2,
    href: "/master-data-management/terminals",
  },
  {
    key: "vessels",
    label: "Vessel Registry",
    description: "Vessel particulars and registry",
    icon: Ship,
    href: "/master-data-management/vessels",
  },
  {
    key: "commodities",
    label: "Commodities & HS Codes",
    description: "Commodity and HS code master data",
    icon: Package,
    href: "/master-data-management/commodities",
  },
  {
    key: "containerTypes",
    label: "Container Types",
    description: "Container ISO codes and specifications",
    icon: Box,
    href: "/master-data-management/container-types",
  },
  {
    key: "customers",
    label: "Customers & Agents",
    description: "Customer and agent hierarchy",
    icon: Users,
    href: "/master-data-management/customers",
  },
  {
    key: "tariffCodes",
    label: "Freight Tariffs",
    description: "Freight tariff code master",
    icon: Receipt,
    href: "/master-data-management/tariffs",
  },
  {
    key: "exchangeRates",
    label: "Exchange Rates",
    description: "Currency exchange rate management",
    icon: ArrowLeftRight,
    href: "/master-data-management/exchange-rates",
  },
  {
    key: "glAccounts",
    label: "GL Accounts",
    description: "Chart of accounts",
    icon: Landmark,
    href: "/master-data-management/gl-accounts",
  },
  {
    key: "costCentres",
    label: "Cost Centres",
    description: "Cost centre management",
    icon: DollarSign,
    href: "/master-data-management/cost-centres",
  },
];

export default async function MasterDataManagementPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const canView = await hasPermission(session.id, session.tenantId, "masterdata:read");
  if (!canView) redirect("/");

  const overview = await getMdmOverview(session.tenantId);
  const countMap = overview as Record<string, number>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Master Data Management
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage reference data used across the ERP system
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {MDM_SECTIONS.map((section) => {
          const Icon = section.icon;
          const count = countMap[section.key] ?? 0;
          return (
            <Link
              key={section.key}
              href={section.href}
              className="group rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all hover:border-brand-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  {count}
                </span>
              </div>
              <h3 className="mt-3 font-semibold text-slate-900">
                {section.label}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {section.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
