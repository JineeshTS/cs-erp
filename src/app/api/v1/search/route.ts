import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, or, ilike, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  ports,
  vessels,
  customers,
  firmFreightInvoices,
  odmBillsOfLading,
  cspPortalBookings,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse } from "@/lib/auth/api-auth";

interface SearchResult {
  type: string;
  id: string;
  label: string;
  sublabel: string;
  href: string;
}

const querySchema = z.object({
  q: z.string().min(1).max(255),
});

const RESULTS_PER_ENTITY = 5;

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();

    const url = new URL(request.url);
    const parsed = querySchema.safeParse({ q: url.searchParams.get("q") });
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Search query (q) is required and must be 1-255 chars",
          },
        },
        { status: 400 }
      );
    }

    const term = parsed.data.q;
    const pattern = `%${term}%`;
    const tenantId = user.tenantId;
    const results: SearchResult[] = [];

    // Search ports (name, unLocode)
    const portResults = await db
      .select({ id: ports.id, name: ports.name, unLocode: ports.unLocode, country: ports.country })
      .from(ports)
      .where(
        and(
          eq(ports.tenantId, tenantId),
          isNull(ports.deletedAt),
          or(ilike(ports.name, pattern), ilike(ports.unLocode, pattern))
        )
      )
      .limit(RESULTS_PER_ENTITY);

    for (const p of portResults) {
      results.push({
        type: "Port",
        id: p.id,
        label: p.name,
        sublabel: `${p.unLocode} - ${p.country}`,
        href: `/master-data-management/ports/${p.id}`,
      });
    }

    // Search vessels (name, imoNumber)
    const vesselResults = await db
      .select({ id: vessels.id, name: vessels.name, imoNumber: vessels.imoNumber, vesselType: vessels.vesselType })
      .from(vessels)
      .where(
        and(
          eq(vessels.tenantId, tenantId),
          isNull(vessels.deletedAt),
          or(ilike(vessels.name, pattern), ilike(vessels.imoNumber, pattern))
        )
      )
      .limit(RESULTS_PER_ENTITY);

    for (const v of vesselResults) {
      results.push({
        type: "Vessel",
        id: v.id,
        label: v.name,
        sublabel: `IMO ${v.imoNumber} - ${v.vesselType}`,
        href: `/master-data-management/vessels/${v.id}`,
      });
    }

    // Search customers (name, shortName)
    const customerResults = await db
      .select({ id: customers.id, name: customers.name, shortName: customers.shortName, customerType: customers.customerType })
      .from(customers)
      .where(
        and(
          eq(customers.tenantId, tenantId),
          isNull(customers.deletedAt),
          or(
            ilike(customers.name, pattern),
            ilike(customers.shortName, pattern)
          )
        )
      )
      .limit(RESULTS_PER_ENTITY);

    for (const c of customerResults) {
      results.push({
        type: "Customer",
        id: c.id,
        label: c.name,
        sublabel: c.shortName || c.customerType,
        href: `/master-data-management/customers/${c.id}`,
      });
    }

    // Search bookings (bookingRef)
    const bookingResults = await db
      .select({
        id: cspPortalBookings.id,
        bookingRef: cspPortalBookings.bookingRef,
        customerName: cspPortalBookings.customerName,
      })
      .from(cspPortalBookings)
      .where(
        and(
          eq(cspPortalBookings.tenantId, tenantId),
          isNull(cspPortalBookings.deletedAt),
          ilike(cspPortalBookings.bookingRef, pattern)
        )
      )
      .limit(RESULTS_PER_ENTITY);

    for (const b of bookingResults) {
      results.push({
        type: "Booking",
        id: b.id,
        label: b.bookingRef,
        sublabel: b.customerName,
        href: `/customer-portal/bookings/${b.id}`,
      });
    }

    // Search invoices (invoiceNumber)
    const invoiceResults = await db
      .select({
        id: firmFreightInvoices.id,
        invoiceNumber: firmFreightInvoices.invoiceNumber,
        customerName: firmFreightInvoices.customerName,
      })
      .from(firmFreightInvoices)
      .where(
        and(
          eq(firmFreightInvoices.tenantId, tenantId),
          isNull(firmFreightInvoices.deletedAt),
          ilike(firmFreightInvoices.invoiceNumber, pattern)
        )
      )
      .limit(RESULTS_PER_ENTITY);

    for (const inv of invoiceResults) {
      results.push({
        type: "Invoice",
        id: inv.id,
        label: inv.invoiceNumber,
        sublabel: inv.customerName,
        href: `/freight-invoice-revenue-management/invoices/${inv.id}`,
      });
    }

    // Search BLs (blNumber)
    const blResults = await db
      .select({
        id: odmBillsOfLading.id,
        blNumber: odmBillsOfLading.blNumber,
        shipperName: odmBillsOfLading.shipperName,
      })
      .from(odmBillsOfLading)
      .where(
        and(
          eq(odmBillsOfLading.tenantId, tenantId),
          isNull(odmBillsOfLading.deletedAt),
          ilike(odmBillsOfLading.blNumber, pattern)
        )
      )
      .limit(RESULTS_PER_ENTITY);

    for (const bl of blResults) {
      results.push({
        type: "Bill of Lading",
        id: bl.id,
        label: bl.blNumber,
        sublabel: bl.shipperName,
        href: `/operations-documentation/bills-of-lading/${bl.id}`,
      });
    }

    // Limit total results to 20
    return NextResponse.json({ data: results.slice(0, 20) });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Search failed" } },
      { status: 500 }
    );
  }
}
