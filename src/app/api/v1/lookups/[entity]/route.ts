import { NextRequest, NextResponse } from "next/server";
import { getApiUser, unauthorizedResponse } from "@/lib/auth/api-auth";
import { db } from "@/lib/db";
import { cached } from "@/lib/cache";
import {
  ports,
  customers,
  vessels,
  containerTypes,
  commodities,
  terminals,
  currencies,
  countries,
  regions,
  tradeLanes,
  vesselClasses,
} from "@/db/schema";
import { and, eq, isNull, ilike, or, asc } from "drizzle-orm";

const VALID_ENTITIES = [
  "ports", "vessels", "customers", "commodities", "container-types", "terminals",
  "currencies", "countries", "regions", "trade-lanes", "vessel-classes",
] as const;
type EntityType = (typeof VALID_ENTITIES)[number];

/**
 * GET /api/v1/lookups/[entity]?q=search&limit=20
 *
 * Server-side searchable lookup for master data entities.
 * Replaces the static .limit(50) lookups in lookups.ts.
 * Used by the SearchableSelect component.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return unauthorizedResponse();

  const { entity } = await params;
  if (!VALID_ENTITIES.includes(entity as EntityType)) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: `Unknown entity: ${entity}. Valid: ${VALID_ENTITIES.join(", ")}` } },
      { status: 400 }
    );
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() || "";
  const parentId = request.nextUrl.searchParams.get("parentId")?.trim() || "";
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "20", 10), 50);
  const tenantId = user.tenantId;
  const searchPattern = `%${q}%`;

  try {
    // ERP-109: Cache lookups in Redis (5 min TTL). Empty search = full list, cached aggressively.
    const cacheKey = `lookup:${tenantId}:${entity}:${q}:${parentId}:${limit}`;
    const options = await cached<{ value: string; label: string }[]>(cacheKey, async () => {
    let result: { value: string; label: string }[] = [];

    switch (entity as EntityType) {
      case "ports": {
        const rows = await db
          .select({ unLocode: ports.unLocode, name: ports.name })
          .from(ports)
          .where(and(
            eq(ports.tenantId, tenantId),
            eq(ports.status, "active"),
            isNull(ports.deletedAt),
            q ? or(ilike(ports.name, searchPattern), ilike(ports.unLocode, searchPattern)) : undefined
          ))
          .orderBy(asc(ports.name))
          .limit(limit);
        result = rows.map((r) => ({ value: r.unLocode, label: `${r.name} (${r.unLocode})` }));
        break;
      }
      case "vessels": {
        const rows = await db
          .select({ name: vessels.name, imoNumber: vessels.imoNumber })
          .from(vessels)
          .where(and(
            eq(vessels.tenantId, tenantId),
            eq(vessels.status, "active"),
            isNull(vessels.deletedAt),
            q ? or(ilike(vessels.name, searchPattern), ilike(vessels.imoNumber, searchPattern)) : undefined
          ))
          .orderBy(asc(vessels.name))
          .limit(limit);
        result = rows.map((r) => ({ value: r.name, label: `${r.name} (IMO ${r.imoNumber})` }));
        break;
      }
      case "customers": {
        const rows = await db
          .select({ id: customers.id, name: customers.name, shortName: customers.shortName })
          .from(customers)
          .where(and(
            eq(customers.tenantId, tenantId),
            eq(customers.status, "active"),
            isNull(customers.deletedAt),
            q ? or(ilike(customers.name, searchPattern), ilike(customers.shortName, searchPattern)) : undefined
          ))
          .orderBy(asc(customers.name))
          .limit(limit);
        result = rows.map((r) => ({ value: r.name, label: r.shortName ? `${r.name} (${r.shortName})` : r.name }));
        break;
      }
      case "commodities": {
        const rows = await db
          .select({ hsCode: commodities.hsCode, description: commodities.description })
          .from(commodities)
          .where(and(
            eq(commodities.tenantId, tenantId),
            eq(commodities.status, "active"),
            isNull(commodities.deletedAt),
            q ? or(ilike(commodities.hsCode, searchPattern), ilike(commodities.description, searchPattern)) : undefined
          ))
          .orderBy(asc(commodities.hsCode))
          .limit(limit);
        result = rows.map((r) => ({ value: r.hsCode, label: `${r.hsCode} — ${r.description}` }));
        break;
      }
      case "container-types": {
        const rows = await db
          .select({ isoCode: containerTypes.isoCode, description: containerTypes.description })
          .from(containerTypes)
          .where(and(
            eq(containerTypes.tenantId, tenantId),
            eq(containerTypes.status, "active"),
            isNull(containerTypes.deletedAt),
            q ? or(ilike(containerTypes.isoCode, searchPattern), ilike(containerTypes.description, searchPattern)) : undefined
          ))
          .orderBy(asc(containerTypes.isoCode))
          .limit(limit);
        result = rows.map((r) => ({ value: r.isoCode, label: `${r.isoCode} — ${r.description}` }));
        break;
      }
      case "terminals": {
        const rows = await db
          .select({ id: terminals.id, name: terminals.name, code: terminals.code })
          .from(terminals)
          .where(and(
            eq(terminals.tenantId, tenantId),
            eq(terminals.status, "active"),
            isNull(terminals.deletedAt),
            parentId ? eq(terminals.portId, parentId) : undefined,
            q ? or(ilike(terminals.name, searchPattern), ilike(terminals.code, searchPattern)) : undefined
          ))
          .orderBy(asc(terminals.name))
          .limit(limit);
        result = rows.map((r) => ({ value: r.name, label: r.code ? `${r.name} (${r.code})` : r.name }));
        break;
      }
      case "currencies": {
        const rows = await db
          .select({ code: currencies.code, name: currencies.name, symbol: currencies.symbol })
          .from(currencies)
          .where(and(
            eq(currencies.tenantId, tenantId),
            eq(currencies.isActive, true),
            isNull(currencies.deletedAt),
            q ? or(ilike(currencies.code, searchPattern), ilike(currencies.name, searchPattern)) : undefined
          ))
          .orderBy(asc(currencies.code))
          .limit(limit);
        result = rows.map((r) => ({ value: r.code, label: `${r.code} — ${r.name}${r.symbol ? ` (${r.symbol})` : ""}` }));
        break;
      }
      case "countries": {
        const rows = await db
          .select({ code: countries.code, name: countries.name, code3: countries.code3 })
          .from(countries)
          .where(and(
            eq(countries.tenantId, tenantId),
            eq(countries.isActive, true),
            isNull(countries.deletedAt),
            parentId ? eq(countries.regionId, parentId) : undefined,
            q ? or(ilike(countries.code, searchPattern), ilike(countries.name, searchPattern)) : undefined
          ))
          .orderBy(asc(countries.name))
          .limit(limit);
        result = rows.map((r) => ({ value: r.code, label: `${r.name} (${r.code})` }));
        break;
      }
      case "regions": {
        const rows = await db
          .select({ id: regions.id, code: regions.code, name: regions.name })
          .from(regions)
          .where(and(
            eq(regions.tenantId, tenantId),
            eq(regions.isActive, true),
            isNull(regions.deletedAt),
            q ? or(ilike(regions.code, searchPattern), ilike(regions.name, searchPattern)) : undefined
          ))
          .orderBy(asc(regions.name))
          .limit(limit);
        result = rows.map((r) => ({ value: String(r.id), label: `${r.name} (${r.code})` }));
        break;
      }
      case "trade-lanes": {
        const rows = await db
          .select({ id: tradeLanes.id, code: tradeLanes.code, name: tradeLanes.name })
          .from(tradeLanes)
          .where(and(
            eq(tradeLanes.tenantId, tenantId),
            eq(tradeLanes.isActive, true),
            isNull(tradeLanes.deletedAt),
            q ? or(ilike(tradeLanes.code, searchPattern), ilike(tradeLanes.name, searchPattern)) : undefined
          ))
          .orderBy(asc(tradeLanes.name))
          .limit(limit);
        result = rows.map((r) => ({ value: String(r.id), label: `${r.code} — ${r.name}` }));
        break;
      }
      case "vessel-classes": {
        const rows = await db
          .select({ id: vesselClasses.id, code: vesselClasses.code, name: vesselClasses.name })
          .from(vesselClasses)
          .where(and(
            eq(vesselClasses.tenantId, tenantId),
            eq(vesselClasses.isActive, true),
            isNull(vesselClasses.deletedAt),
            q ? or(ilike(vesselClasses.code, searchPattern), ilike(vesselClasses.name, searchPattern)) : undefined
          ))
          .orderBy(asc(vesselClasses.name))
          .limit(limit);
        result = rows.map((r) => ({ value: String(r.id), label: `${r.code} — ${r.name}` }));
        break;
      }
    }

    return result;
    }); // end cached()

    return NextResponse.json({ data: options });
  } catch (err) {
    console.error(`[lookups/${entity}] Error:`, err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch lookup options" } },
      { status: 500 }
    );
  }
}
