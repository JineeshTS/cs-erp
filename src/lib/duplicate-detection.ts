import Fuse from "fuse.js";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { ports, vessels, customers } from "@/db/schema";

export type DuplicateEntityType = "ports" | "vessels" | "customers";

export interface DuplicateMatch {
  id: string;
  name: string;
  score: number;
  matchedField: string;
}

export interface DuplicateCheckResult {
  hasDuplicates: boolean;
  matches: DuplicateMatch[];
}

interface EntityRecord {
  id: string;
  [key: string]: string | null | undefined;
}

/**
 * Configuration for each entity type: which table to query,
 * which fields to load, and which fields to run fuzzy matching on.
 */
const ENTITY_CONFIG: Record<
  DuplicateEntityType,
  {
    fetchRecords: (tenantId: string) => Promise<EntityRecord[]>;
    fuseKeys: { name: string; weight: number }[];
  }
> = {
  ports: {
    fetchRecords: async (tenantId: string) => {
      const rows = await db
        .select({ id: ports.id, name: ports.name, unLocode: ports.unLocode })
        .from(ports)
        .where(and(eq(ports.tenantId, tenantId), isNull(ports.deletedAt)))
        .limit(500);
      return rows;
    },
    fuseKeys: [
      { name: "name", weight: 0.6 },
      { name: "unLocode", weight: 0.4 },
    ],
  },
  vessels: {
    fetchRecords: async (tenantId: string) => {
      const rows = await db
        .select({ id: vessels.id, name: vessels.name, imoNumber: vessels.imoNumber })
        .from(vessels)
        .where(and(eq(vessels.tenantId, tenantId), isNull(vessels.deletedAt)))
        .limit(500);
      return rows;
    },
    fuseKeys: [
      { name: "name", weight: 0.6 },
      { name: "imoNumber", weight: 0.4 },
    ],
  },
  customers: {
    fetchRecords: async (tenantId: string) => {
      const rows = await db
        .select({
          id: customers.id,
          name: customers.name,
          shortName: customers.shortName,
          taxId: customers.taxId,
        })
        .from(customers)
        .where(
          and(eq(customers.tenantId, tenantId), isNull(customers.deletedAt))
        )
        .limit(500);
      return rows;
    },
    fuseKeys: [
      { name: "name", weight: 0.5 },
      { name: "shortName", weight: 0.3 },
      { name: "taxId", weight: 0.2 },
    ],
  },
};

/**
 * In-memory cache for recently loaded entity records.
 * TTL: 60 seconds. Keyed by `${tenantId}:${entityType}`.
 */
const recordCache = new Map<
  string,
  { data: EntityRecord[]; expires: number }
>();
const CACHE_TTL_MS = 60_000;

async function getCachedRecords(
  tenantId: string,
  entityType: DuplicateEntityType
): Promise<EntityRecord[]> {
  const cacheKey = `${tenantId}:${entityType}`;
  const cached = recordCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const config = ENTITY_CONFIG[entityType];
  const records = await config.fetchRecords(tenantId);
  recordCache.set(cacheKey, { data: records, expires: Date.now() + CACHE_TTL_MS });
  return records;
}

/**
 * Detect potential duplicates for a candidate record using Fuse.js fuzzy matching.
 *
 * @param tenantId - Tenant context
 * @param entityType - "ports" | "vessels" | "customers"
 * @param candidateFields - The fields of the record being created (e.g., { name: "Jebel Ali" })
 * @returns Duplicate check result with matches scored < 0.3
 */
export async function detectDuplicates(
  tenantId: string,
  entityType: DuplicateEntityType,
  candidateFields: Record<string, string>
): Promise<DuplicateCheckResult> {
  const config = ENTITY_CONFIG[entityType];
  if (!config) {
    return { hasDuplicates: false, matches: [] };
  }

  const existingRecords = await getCachedRecords(tenantId, entityType);
  if (existingRecords.length === 0) {
    return { hasDuplicates: false, matches: [] };
  }

  const fuse = new Fuse(existingRecords, {
    keys: config.fuseKeys,
    threshold: 0.3, // 0 = perfect match, 1 = match anything
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });

  const allMatches: DuplicateMatch[] = [];
  const seenIds = new Set<string>();

  // Search for each candidate field value against the configured keys
  for (const fuseKey of config.fuseKeys) {
    const searchValue = candidateFields[fuseKey.name];
    if (!searchValue || searchValue.trim().length < 2) continue;

    const fuseResults = fuse.search(searchValue);
    for (const result of fuseResults) {
      const score = result.score ?? 1;
      if (score < 0.3 && !seenIds.has(result.item.id)) {
        seenIds.add(result.item.id);
        allMatches.push({
          id: result.item.id,
          name: result.item.name ?? "",
          score: Math.round(score * 1000) / 1000,
          matchedField: fuseKey.name,
        });
      }
    }
  }

  // Sort by score ascending (best matches first)
  allMatches.sort((a, b) => a.score - b.score);

  return {
    hasDuplicates: allMatches.length > 0,
    matches: allMatches.slice(0, 10), // Cap at 10 matches
  };
}
