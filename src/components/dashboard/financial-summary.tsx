"use client";

import Link from "next/link";
import { DollarSign, TrendingDown } from "lucide-react";

interface FinancialSummaryProps {
  invoicedMtd: number;
  collectedMtd: number;
  outstanding: number;
  portDisbursements: number;
  bunkerCosts: number;
  currency: string;
}

function fmt(cents: number, currency: string): string {
  if (cents === 0) return "$0";
  const amount = cents / 100;
  const formatter = new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    notation: amount >= 1000 ? "compact" : "standard",
    maximumFractionDigits: amount >= 1000 ? 1 : 0,
  });
  return formatter.format(amount);
}

export function FinancialSummary({
  invoicedMtd,
  collectedMtd,
  outstanding,
  portDisbursements,
  bunkerCosts,
  currency,
}: FinancialSummaryProps) {
  const allZero = invoicedMtd === 0 && collectedMtd === 0 && outstanding === 0 && portDisbursements === 0 && bunkerCosts === 0;

  if (allZero) {
    return (
      <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Financial Summary</h3>
        <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center">
          <DollarSign className="h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No financial activity this month</p>
          <Link
            href="/invoicing-hub"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            View invoices
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Financial Summary — MTD</h3>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {/* Revenue Column */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Revenue
            </span>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Invoiced</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {fmt(invoicedMtd, currency)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Collected</span>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {fmt(collectedMtd, currency)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Outstanding</span>
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                {fmt(outstanding, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Costs Column */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Costs
            </span>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Port Disbursements</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {fmt(portDisbursements, currency)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Bunker Fuel</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {fmt(bunkerCosts, currency)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Total Costs</span>
              <span className="text-sm font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                {fmt(portDisbursements + bunkerCosts, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
