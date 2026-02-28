import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  Coins,
  ArrowLeftRight,
  Receipt,
  Scale,
  Percent,
  Handshake,
  Layers,
  Cloud,
  RefreshCw,
  ShieldCheck,
  FileCheck,
  Globe,
  Languages,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getMelsOverview } from "@/lib/multi-entity-legal-structure/service";

export default async function MultiEntityLegalStructurePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const canRead = await hasPermission(
    session.id,
    session.tenantId,
    "entities:read"
  );
  if (!canRead) redirect("/");

  const overview = await getMelsOverview(session.tenantId);

  const sections = [
    {
      title: "Legal Entities",
      description: "Manage subsidiaries, branches, and corporate structure",
      count: overview.legalEntities,
      href: "/multi-entity-legal-structure/legal-entities",
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Currency Configs",
      description: "Configure currencies per legal entity",
      count: overview.currencyConfigs,
      href: "/multi-entity-legal-structure/currency-configs",
      icon: Coins,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "FX Rates",
      description: "Manage foreign exchange rates and providers",
      count: overview.fxRates,
      href: "/multi-entity-legal-structure/fx-rates",
      icon: ArrowLeftRight,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Tax Configs",
      description: "Regional tax type definitions and rules",
      count: overview.taxConfigs,
      href: "/multi-entity-legal-structure/tax-configs",
      icon: Receipt,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Tax Rates",
      description: "Tax rates with effective date ranges",
      count: overview.taxRates,
      href: "/multi-entity-legal-structure/tax-rates",
      icon: Percent,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "Intercompany Transactions",
      description: "Track transactions between legal entities",
      count: overview.intercompanyTransactions,
      href: "/multi-entity-legal-structure/intercompany-transactions",
      icon: Handshake,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "Settlement Batches",
      description: "Batch netting and settlement of intercompany balances",
      count: overview.settlementBatches,
      href: "/multi-entity-legal-structure/settlement-batches",
      icon: Layers,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
    {
      title: "Settlement Items",
      description: "Individual items within settlement batches",
      count: overview.settlementItems,
      href: "/multi-entity-legal-structure/settlement-items",
      icon: Scale,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      title: "Oracle Integration",
      description: "Oracle Fusion integration configs for consolidation",
      count: overview.oracleIntegrationConfigs,
      href: "/multi-entity-legal-structure/oracle-integration-configs",
      icon: Cloud,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Oracle Sync Logs",
      description: "Synchronisation history and error logs",
      count: overview.oracleSyncLogs,
      href: "/multi-entity-legal-structure/oracle-sync-logs",
      icon: RefreshCw,
      color: "text-slate-600",
      bg: "bg-slate-50",
    },
    {
      title: "Compliance Rules",
      description: "Regional regulatory rules and requirements",
      count: overview.complianceRules,
      href: "/multi-entity-legal-structure/compliance-rules",
      icon: ShieldCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Compliance Filings",
      description: "Track filing status and deadlines",
      count: overview.complianceFilings,
      href: "/multi-entity-legal-structure/compliance-filings",
      icon: FileCheck,
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      title: "Locale Configs",
      description: "Language, direction, and formatting settings",
      count: overview.localeConfigs,
      href: "/multi-entity-legal-structure/locale-configs",
      icon: Globe,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Translations",
      description: "Manage UI translations across locales",
      count: overview.translations,
      href: "/multi-entity-legal-structure/translations",
      icon: Languages,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Multi-Entity & Legal Structure
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage legal entities, currencies, tax compliance, intercompany
          transactions, and localization
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-lg border bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${section.bg}`}
                >
                  <Icon className={`h-5 w-5 ${section.color}`} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 group-hover:text-blue-600">
                    {section.title}
                  </h2>
                  <p className="text-xs text-gray-500">{section.description}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-gray-900">
                  {section.count}
                </span>
                <span className="ms-1 text-sm text-gray-500">records</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
