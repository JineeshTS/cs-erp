import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  FileText,
  Receipt,
  MapPin,
} from "lucide-react";
import { db } from "@/lib/db";
import { sql, eq, and, isNull } from "drizzle-orm";
import {
  cspPortalBookings,
  cspPortalDocuments,
  cspPortalInvoices,
} from "@/db/schema";

/**
 * ERP-093: Portal dashboard — shows active bookings, documents, pending invoices.
 * Links to bookings, documents, invoices, and tracking sections.
 */
export default async function PortalDashboardPage() {
  const cookieStore = await cookies();
  const portalSession = cookieStore.get("portal_session")?.value;
  if (!portalSession) redirect("/login");

  // Parse portal session (customerId:tenantId)
  const [customerId, tenantId] = portalSession.split(":");
  if (!customerId || !tenantId) redirect("/login");

  const [activeBookings, documentsCount, pendingInvoices] = await Promise.all([
    db
      .select({ value: sql<number>`cast(count(*) as int)` })
      .from(cspPortalBookings)
      .where(
        and(
          eq(cspPortalBookings.tenantId, tenantId),
          eq(cspPortalBookings.customerId, customerId),
          isNull(cspPortalBookings.deletedAt),
          eq(cspPortalBookings.status, "confirmed")
        )
      )
      .then((r) => r[0]?.value ?? 0),
    db
      .select({ value: sql<number>`cast(count(*) as int)` })
      .from(cspPortalDocuments)
      .where(
        and(
          eq(cspPortalDocuments.tenantId, tenantId),
          eq(cspPortalDocuments.customerId, customerId),
          isNull(cspPortalDocuments.deletedAt)
        )
      )
      .then((r) => r[0]?.value ?? 0),
    db
      .select({ value: sql<number>`cast(count(*) as int)` })
      .from(cspPortalInvoices)
      .where(
        and(
          eq(cspPortalInvoices.tenantId, tenantId),
          eq(cspPortalInvoices.customerId, customerId),
          isNull(cspPortalInvoices.deletedAt),
          eq(cspPortalInvoices.status, "issued")
        )
      )
      .then((r) => r[0]?.value ?? 0),
  ]);

  const cards = [
    {
      label: "Active Bookings",
      value: activeBookings,
      icon: ShoppingCart,
      href: "/customer-portal/bookings",
      color: "blue",
    },
    {
      label: "Documents",
      value: documentsCount,
      icon: FileText,
      href: "/customer-portal/documents",
      color: "purple",
    },
    {
      label: "Pending Invoices",
      value: pendingInvoices,
      icon: Receipt,
      href: "/customer-portal/invoices",
      color: "orange",
    },
    {
      label: "Track Shipment",
      value: null,
      icon: MapPin,
      href: "/customer-portal/tracking",
      color: "green",
    },
  ] as const;

  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
  } as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Welcome to your customer portal
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-lg border bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-lg p-2.5 ${colorMap[card.color]}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  {card.value !== null ? (
                    <p className="text-2xl font-bold text-gray-900">
                      {card.value}
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-gray-700">
                      View &rarr;
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
