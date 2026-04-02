/**
 * BAPLIE Parser Engine (ERP-081)
 *
 * Domain-specific parser for UN/EDIFACT BAPLIE messages (Bayplan/stowage plan).
 * Extracts container positions from LOC, EQD, and MEA segments.
 *
 * BAPLIE message structure (per container):
 *   LOC+147+BBRRTT:... — stowage position (bay/row/tier)
 *   EQD+CN+ABCU1234567+... — equipment (container number, type/size)
 *   MEA+AAE+VGM+KGM:28500 — measurement (gross weight)
 *
 * Bay-Row-Tier encoding: 6-digit string BBRRTT
 *   BB = bay (01-99, odd = 20ft, even = 40ft)
 *   RR = row (01-99, odd = port, even = starboard, 00 = center)
 *   TT = tier (02-98, from bottom)
 */

export interface BaplieContainer {
  containerNumber: string;
  position: {
    bay: string;
    row: string;
    tier: string;
  };
  containerType: string;
  grossWeight: number;
}

/**
 * Parse a BAPLIE EDIFACT message and extract container stowage positions.
 *
 * @param edifactText - raw EDIFACT BAPLIE message text
 * @returns Array of container records with positions
 */
export function parseBaplie(edifactText: string): BaplieContainer[] {
  // Split into segments (EDIFACT delimiter is ')
  const segments = edifactText
    .split("'")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const containers: BaplieContainer[] = [];
  let currentPosition: { bay: string; row: string; tier: string } | null = null;
  let currentContainer: string = "";
  let currentType: string = "";
  let currentWeight: number = 0;

  for (const segment of segments) {
    const tag = segment.substring(0, 3).toUpperCase();

    if (tag === "LOC") {
      // Flush previous container if we have one
      if (currentContainer && currentPosition) {
        containers.push({
          containerNumber: currentContainer,
          position: currentPosition,
          containerType: currentType,
          grossWeight: currentWeight,
        });
      }

      // Parse LOC segment: LOC+147+BBRRTT:...
      const parts = segment.split("+");
      const qualifier = parts[1] ?? "";

      // LOC+147 = stowage position, LOC+6 = discharge port (skip non-stowage)
      if (qualifier === "147" && parts[2]) {
        const locData = parts[2].split(":")[0] ?? "";
        currentPosition = parseStowagePosition(locData);
      } else {
        currentPosition = null;
      }

      // Reset container data for new LOC group
      currentContainer = "";
      currentType = "";
      currentWeight = 0;
    } else if (tag === "EQD" && currentPosition) {
      // Parse EQD segment: EQD+CN+ABCU1234567+containerType...
      const parts = segment.split("+");
      const eqQualifier = parts[1] ?? "";

      // EQD+CN = container
      if (eqQualifier === "CN") {
        currentContainer = parts[2]?.split(":")[0] ?? "";
        currentType = parts[3]?.split(":")[0] ?? "";
      }
    } else if (tag === "MEA" && currentPosition) {
      // Parse MEA segment: MEA+AAE+VGM+KGM:28500 or MEA+AAE+G+KGM:28500
      const parts = segment.split("+");
      const measureQualifier = parts[2] ?? "";

      // Accept VGM (verified gross mass), G (gross weight), WT (weight)
      if (["VGM", "G", "WT"].includes(measureQualifier)) {
        const valuePart = parts[3] ?? "";
        const weightStr = valuePart.split(":")[1] ?? valuePart.split(":")[0] ?? "0";
        currentWeight = parseFloat(weightStr) || 0;
      }
    }
  }

  // Flush the last container
  if (currentContainer && currentPosition) {
    containers.push({
      containerNumber: currentContainer,
      position: currentPosition,
      containerType: currentType,
      grossWeight: currentWeight,
    });
  }

  return containers;
}

/**
 * Parse a 6-digit stowage position string into bay/row/tier.
 * Format: BBRRTT (e.g., "010102" = bay 01, row 01, tier 02)
 */
function parseStowagePosition(raw: string): { bay: string; row: string; tier: string } {
  const cleaned = raw.replace(/\s/g, "").padStart(6, "0");
  return {
    bay: cleaned.substring(0, 2),
    row: cleaned.substring(2, 4),
    tier: cleaned.substring(4, 6),
  };
}
