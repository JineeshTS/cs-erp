"use client";

/**
 * EntityBindingPanel (D-006 Phase 3)
 *
 * Shows real entities produced by completed flow steps.
 * Displays entity table, ID, action (create/update/read),
 * key data fields, and a link to the module page.
 */

import { ExternalLink, Database, Plus, RefreshCw, Eye } from "lucide-react";
import Link from "next/link";

// ── Types ──

interface EntityBinding {
  bindingId: string;
  entityId: string;
  entityTable: string;
  entityAction: string;
  entityData: Record<string, unknown> | null;
  createdAt: string;
}

interface EntityBindingPanelProps {
  bindings: EntityBinding[];
}

// ── Table → Module URL mapping ──

const TABLE_MODULE_URLS: Record<string, string> = {
  scm_leads: "/sales-crm/leads",
  scm_opportunities: "/sales-crm/opportunities",
  scm_rate_quotations: "/sales-crm/rate-quotations",
  scm_contracts: "/sales-crm/contracts",
  scm_customers: "/customer-management/customers",
};

const TABLE_LABELS: Record<string, string> = {
  scm_leads: "Lead",
  scm_opportunities: "Opportunity",
  scm_rate_quotations: "Rate Quotation",
  scm_contracts: "Contract",
  scm_customers: "Customer",
};

const ACTION_CONFIG: Record<string, { icon: typeof Plus; label: string; color: string }> = {
  create: { icon: Plus, label: "Created", color: "text-emerald-600 dark:text-emerald-400" },
  update: { icon: RefreshCw, label: "Updated", color: "text-blue-600 dark:text-blue-400" },
  read: { icon: Eye, label: "Read", color: "text-gray-600 dark:text-gray-400" },
};

function getEntityDisplayFields(entityData: Record<string, unknown> | null): Array<{ label: string; value: string }> {
  if (!entityData) return [];
  const fields: Array<{ label: string; value: string }> = [];

  // Pick the most useful fields to display
  const displayKeys: Record<string, string> = {
    companyName: "Company",
    contactName: "Contact",
    qualificationScore: "Score",
    status: "Status",
    opportunityName: "Opportunity",
    expectedTeu: "TEU",
    tradeLane: "Trade Lane",
    quotationNumber: "Quote #",
    totalAmount: "Amount",
    originPort: "Origin",
    destinationPort: "Destination",
    contractNumber: "Contract #",
    customerCode: "Customer",
  };

  for (const [key, label] of Object.entries(displayKeys)) {
    if (key in entityData && entityData[key] != null) {
      const val = entityData[key];
      fields.push({
        label,
        value: typeof val === "object" ? JSON.stringify(val) : String(val),
      });
    }
    if (fields.length >= 4) break; // Max 4 fields shown
  }

  return fields;
}

// ── Component ──

export function EntityBindingPanel({ bindings }: EntityBindingPanelProps) {
  if (bindings.length === 0) return null;

  return (
    <div className="space-y-2">
      {bindings.map((binding) => {
        const actionConf = ACTION_CONFIG[binding.entityAction] ?? ACTION_CONFIG.read;
        const ActionIcon = actionConf.icon;
        const label = TABLE_LABELS[binding.entityTable] ?? binding.entityTable;
        const moduleUrl = TABLE_MODULE_URLS[binding.entityTable];
        const displayFields = getEntityDisplayFields(binding.entityData);

        return (
          <div
            key={binding.bindingId}
            className="rounded-md border border-emerald-200 bg-emerald-50/50 p-2.5 dark:border-emerald-800 dark:bg-emerald-950/20"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  {label}
                </span>
                <span className={`flex items-center gap-0.5 text-[10px] font-medium ${actionConf.color}`}>
                  <ActionIcon className="h-2.5 w-2.5" />
                  {actionConf.label}
                </span>
              </div>
              {moduleUrl && (
                <Link
                  href={`${moduleUrl}/${binding.entityId}`}
                  className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  title="View in module"
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                  View
                </Link>
              )}
            </div>

            {displayFields.length > 0 && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                {displayFields.map((f) => (
                  <div key={f.label} className="flex items-baseline gap-1 text-[11px]">
                    <span className="text-gray-500 dark:text-gray-400">{f.label}:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{f.value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-1 text-[9px] font-mono text-gray-400 dark:text-gray-500">
              {binding.entityTable}:{binding.entityId.slice(0, 8)}...
            </div>
          </div>
        );
      })}
    </div>
  );
}
