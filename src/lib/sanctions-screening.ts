/**
 * ERP-123: Sanctions Screening Integration
 *
 * Local fuzzy screening against a hardcoded subset of OFAC SDN entries.
 * Uses fuse.js for fuzzy name matching. When a real API is available,
 * this function can be swapped to call OFAC/EU/UN APIs.
 */

import Fuse from "fuse.js";

interface SanctionEntry {
  listName: string;
  listId: string;
  name: string;
  type: "individual" | "organization";
}

interface ScreeningMatch {
  listName: string;
  matchedName: string;
  score: number;
  listId: string;
}

interface ScreeningResult {
  screened: true;
  matches: ScreeningMatch[];
  status: "clear" | "potential_match" | "match";
}

/**
 * Hardcoded subset of OFAC SDN entries (top 100 by name pattern).
 * These are well-known sanctioned entities used for local screening.
 * In production, this would be replaced by a regularly updated database
 * or real-time API calls.
 */
const SANCTIONS_LIST: SanctionEntry[] = [
  { listName: "OFAC_SDN", listId: "SDN-001", name: "ATOMIC ENERGY ORGANIZATION OF IRAN", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-002", name: "BANK MELLI IRAN", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-003", name: "BANK MELLAT", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-004", name: "BANK SADERAT IRAN", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-005", name: "BANK SEPAH", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-006", name: "CENTRAL BANK OF IRAN", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-007", name: "ISLAMIC REPUBLIC OF IRAN SHIPPING LINES", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-008", name: "NATIONAL IRANIAN OIL COMPANY", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-009", name: "NATIONAL IRANIAN TANKER COMPANY", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-010", name: "IRAN AIR", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-011", name: "MAHAN AIR", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-012", name: "KHATAM AL-ANBIYA CONSTRUCTION", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-013", name: "KOREA MINING DEVELOPMENT TRADING CORPORATION", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-014", name: "KOREA RYONBONG GENERAL CORPORATION", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-015", name: "FOREIGN TRADE BANK OF DPRK", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-016", name: "OCEAN MARITIME MANAGEMENT COMPANY", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-017", name: "KOREA NATIONAL INSURANCE CORPORATION", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-018", name: "BANCO NACIONAL DE CUBA", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-019", name: "PETROLEOS DE VENEZUELA", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-020", name: "BANCO DE VENEZUELA", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-021", name: "CENTRAL BANK OF SYRIA", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-022", name: "COMMERCIAL BANK OF SYRIA", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-023", name: "SYRIANAIR", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-024", name: "GENERAL ORGANIZATION OF TOBACCO", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-025", name: "RUSSIAN AGRICULTURAL BANK", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-026", name: "SBERBANK OF RUSSIA", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-027", name: "VTB BANK", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-028", name: "GAZPROMBANK", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-029", name: "ALFA-BANK", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-030", name: "BANK ROSSIYA", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-031", name: "PROMSVYAZBANK", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-032", name: "SOVCOMBANK", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-033", name: "NOVIKOMBANK", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-034", name: "RUSSIAN DIRECT INVESTMENT FUND", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-035", name: "ROSNEFT OIL COMPANY", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-036", name: "GAZPROM", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-037", name: "UNITED SHIPBUILDING CORPORATION", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-038", name: "ROSTEC", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-039", name: "ALROSA", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-040", name: "RUSSIAN RAILWAYS", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-041", name: "AEROFLOT", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-042", name: "SOVCOMFLOT", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-043", name: "ALMAZ-ANTEY", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-044", name: "TACTICAL MISSILES CORPORATION", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-045", name: "KALASHNIKOV CONCERN", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-046", name: "WAGNER GROUP", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-047", name: "HEZBOLLAH", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-048", name: "HAMAS", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-049", name: "ISLAMIC REVOLUTIONARY GUARD CORPS", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-050", name: "QUDS FORCE", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-051", name: "AL-QAIDA", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-052", name: "ISIS", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-053", name: "BOKO HARAM", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-054", name: "AL-SHABAAB", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-055", name: "TALIBAN", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-056", name: "HUAWEI TECHNOLOGIES", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-057", name: "ZTE CORPORATION", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-058", name: "HIKVISION", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-059", name: "DAHUA TECHNOLOGY", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-060", name: "MEGVII TECHNOLOGY", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-061", name: "COSCO SHIPPING", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-062", name: "CHINA OCEAN SHIPPING COMPANY", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-063", name: "MYANMAR ECONOMIC CORPORATION", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-064", name: "MYANMAR ECONOMIC HOLDINGS LIMITED", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-065", name: "CENTRAL BANK OF MYANMAR", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-066", name: "BELARUSIAN POTASH COMPANY", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-067", name: "BELARUSKALI", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-068", name: "NATIONAL BANK OF THE REPUBLIC OF BELARUS", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-069", name: "BELAVIA", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-070", name: "ERITREAN PEOPLES LIBERATION FRONT", type: "organization" },
  { listName: "EU_CONSOLIDATED", listId: "EU-001", name: "SBERBANK", type: "organization" },
  { listName: "EU_CONSOLIDATED", listId: "EU-002", name: "VTB BANK PUBLIC JOINT STOCK COMPANY", type: "organization" },
  { listName: "EU_CONSOLIDATED", listId: "EU-003", name: "GAZPROMBANK JOINT STOCK COMPANY", type: "organization" },
  { listName: "EU_CONSOLIDATED", listId: "EU-004", name: "RUSSIAN NATIONAL COMMERCIAL BANK", type: "organization" },
  { listName: "EU_CONSOLIDATED", listId: "EU-005", name: "SOVCOMBANK OPEN JOINT STOCK COMPANY", type: "organization" },
  { listName: "EU_CONSOLIDATED", listId: "EU-006", name: "ROSNEFT", type: "organization" },
  { listName: "EU_CONSOLIDATED", listId: "EU-007", name: "TRANSNEFT", type: "organization" },
  { listName: "EU_CONSOLIDATED", listId: "EU-008", name: "LUKOIL", type: "organization" },
  { listName: "EU_CONSOLIDATED", listId: "EU-009", name: "SURGUTNEFTEGAS", type: "organization" },
  { listName: "EU_CONSOLIDATED", listId: "EU-010", name: "SEVERSTAL", type: "organization" },
  { listName: "UN_CONSOLIDATED", listId: "UN-001", name: "KOREA TANGUN TRADING CORPORATION", type: "organization" },
  { listName: "UN_CONSOLIDATED", listId: "UN-002", name: "RECONNAISSANCE GENERAL BUREAU DPRK", type: "organization" },
  { listName: "UN_CONSOLIDATED", listId: "UN-003", name: "MINISTRY OF ATOMIC ENERGY DPRK", type: "organization" },
  { listName: "UN_CONSOLIDATED", listId: "UN-004", name: "GREEN PINE ASSOCIATED CORPORATION", type: "organization" },
  { listName: "UN_CONSOLIDATED", listId: "UN-005", name: "KOREA HYOKSIN TRADING CORPORATION", type: "organization" },
  { listName: "UN_CONSOLIDATED", listId: "UN-006", name: "ANSAR AL-ISLAM", type: "organization" },
  { listName: "UN_CONSOLIDATED", listId: "UN-007", name: "JAISH-I-MOHAMMED", type: "organization" },
  { listName: "UN_CONSOLIDATED", listId: "UN-008", name: "LASHKAR-E-TAYYIBA", type: "organization" },
  { listName: "UN_CONSOLIDATED", listId: "UN-009", name: "JEMAAH ISLAMIYAH", type: "organization" },
  { listName: "UN_CONSOLIDATED", listId: "UN-010", name: "ABU SAYYAF GROUP", type: "organization" },
  { listName: "OFAC_SDN", listId: "SDN-071", name: "NICOLÁS MADURO MOROS", type: "individual" },
  { listName: "OFAC_SDN", listId: "SDN-072", name: "BASHAR AL-ASSAD", type: "individual" },
  { listName: "OFAC_SDN", listId: "SDN-073", name: "ALEXANDER LUKASHENKO", type: "individual" },
  { listName: "OFAC_SDN", listId: "SDN-074", name: "KIM JONG UN", type: "individual" },
  { listName: "OFAC_SDN", listId: "SDN-075", name: "VLADIMIR VLADIMIROVICH PUTIN", type: "individual" },
  { listName: "OFAC_SDN", listId: "SDN-076", name: "SERGEI LAVROV", type: "individual" },
  { listName: "OFAC_SDN", listId: "SDN-077", name: "SERGEI SHOIGU", type: "individual" },
  { listName: "OFAC_SDN", listId: "SDN-078", name: "YEVGENIY VIKTOROVICH PRIGOZHIN", type: "individual" },
  { listName: "OFAC_SDN", listId: "SDN-079", name: "RAMZAN KADYROV", type: "individual" },
  { listName: "OFAC_SDN", listId: "SDN-080", name: "QASEM SOLEIMANI", type: "individual" },
];

// Build fuse.js index once (module-level singleton)
let fuseInstance: Fuse<SanctionEntry> | null = null;

function getFuse(): Fuse<SanctionEntry> {
  if (!fuseInstance) {
    fuseInstance = new Fuse(SANCTIONS_LIST, {
      keys: ["name"],
      threshold: 0.4, // max distance for potential matches
      includeScore: true,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }
  return fuseInstance;
}

/**
 * Screen an entity name against local sanctions lists using fuzzy matching.
 *
 * Threshold interpretation:
 * - score < 0.2 = "match" (strong match)
 * - score < 0.4 = "potential_match" (needs review)
 * - score >= 0.4 = "clear" (no match)
 *
 * @param name - Entity name to screen
 * @param entityType - "individual" or "organization"
 * @param _tenantId - Tenant scope (for future per-tenant list customization)
 * @returns Screening result with match details
 */
export function screenEntity(
  name: string,
  entityType: "individual" | "organization",
  _tenantId: string
): ScreeningResult {
  const fuse = getFuse();
  const results = fuse.search(name.toUpperCase());

  const matches: ScreeningMatch[] = results
    .filter((r) => r.score !== undefined && r.score < 0.4)
    .map((r) => ({
      listName: r.item.listName,
      matchedName: r.item.name,
      score: Math.round((r.score ?? 1) * 1000) / 1000,
      listId: r.item.listId,
    }));

  let status: "clear" | "potential_match" | "match" = "clear";
  if (matches.some((m) => m.score < 0.2)) {
    status = "match";
  } else if (matches.length > 0) {
    status = "potential_match";
  }

  return {
    screened: true,
    matches,
    status,
  };
}
