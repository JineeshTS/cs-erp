import Link from "next/link";
import { FileBarChart, Ship, Package, DollarSign, Clock, Container } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/rbac";

const REPORTS = [
  {
    slug: "vessel-utilization",
    name: "Vessel Utilization",
    description: "Analyze vessel capacity usage, TEU fill rates, and idle time across your fleet.",
    icon: Ship,
  },
  {
    slug: "booking-summary",
    name: "Booking Summary",
    description: "Overview of bookings by status, trade lane, and customer for a given period.",
    icon: Package,
  },
  {
    slug: "revenue-by-trade-lane",
    name: "Revenue by Trade Lane",
    description: "Revenue breakdown by origin-destination trade lanes with freight and surcharge splits.",
    icon: DollarSign,
  },
  {
    slug: "outstanding-ar-aging",
    name: "Outstanding AR Aging",
    description: "Accounts receivable aging buckets (current, 30, 60, 90, 120+ days) by customer.",
    icon: Clock,
  },
  {
    slug: "container-turnaround",
    name: "Container Turnaround",
    description: "Average container dwell times at ports, yards, and customer premises.",
    icon: Container,
  },
] as const;

export default async function ReportsListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await hasPermission(session.id, session.tenantId, "analytics:read")))
    redirect("/analytics-business-intelligence");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Operational Reports
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Pre-built reports with configurable parameters. Select a report to run.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((report) => {
          const Icon = report.icon;
          return (
            <Link
              key={report.slug}
              href={`/analytics-business-intelligence/reports/${report.slug}`}
              className="group rounded-lg border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-600"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-semibold text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                  {report.name}
                </h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {report.description}
              </p>
              <div className="mt-4 text-sm font-medium text-blue-600 group-hover:underline dark:text-blue-400">
                Run Report
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
