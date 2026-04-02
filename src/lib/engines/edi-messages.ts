/**
 * EDI Message-Specific Parsers (ERP-082)
 *
 * Domain-specific parsers for COPARN, IFTMIN, and CUSCAR EDIFACT messages.
 * Each function takes pre-split EDIFACT segments (array of arrays where each
 * inner array = segment components split by '+' then ':').
 *
 * Segment format example:
 *   "RFF+BK:REF123" → ["RFF", "BK:REF123"] after split by '+'
 *   Sub-elements split by ':' → ["BK", "REF123"]
 */

// ==========================================
// Types
// ==========================================

export interface CoparnRecord {
  bookingRef: string;
  containerNumber: string;
  releaseLocation: string;
  pickupDepot: string;
  status: "empty" | "laden" | "unknown";
}

export interface IftminRecord {
  shipper: string;
  consignee: string;
  originPort: string;
  destPort: string;
  commodity: string;
  weight: string;
}

export interface CuscarRecord {
  manifestRef: string;
  blNumber: string;
  packages: number;
  hsCode: string;
  grossWeight: string;
}

// ==========================================
// Helpers
// ==========================================

/** Extract sub-element value: "BK:REF123" → "REF123" given qualifier "BK" */
function subElement(component: string | undefined, qualifier: string): string | null {
  if (!component) return null;
  const parts = component.split(":");
  if (parts[0] === qualifier) return parts[1] ?? "";
  return null;
}

/** Get the first sub-element value (after qualifier) from a component */
function firstSubValue(component: string | undefined): string {
  if (!component) return "";
  const parts = component.split(":");
  return parts[1] ?? parts[0] ?? "";
}

// ==========================================
// COPARN — Container Pre-Announcement
// ==========================================

/**
 * Parse COPARN (Container Pre-Announcement) segments.
 *
 * Relevant segments:
 *   RFF+BK:bookingRef — Booking reference
 *   EQD+CN+containerNumber — Container equipment
 *   LOC+11+location — Release location
 *   LOC+99+location — Pickup depot
 *   FTX+AAA+++status text — Empty/laden status indication
 *
 * @param segments Pre-split EDIFACT segments (each is string[] from split('+'))
 * @returns Array of COPARN container records
 */
export function parseCoparn(segments: string[][]): CoparnRecord[] {
  const records: CoparnRecord[] = [];
  let currentBookingRef = "";
  let currentContainer = "";
  let currentReleaseLocation = "";
  let currentPickupDepot = "";
  let currentStatus: "empty" | "laden" | "unknown" = "unknown";

  for (const seg of segments) {
    const tag = (seg[0] ?? "").substring(0, 3).toUpperCase();

    if (tag === "RFF") {
      // Flush previous record if container exists
      if (currentContainer) {
        records.push({
          bookingRef: currentBookingRef,
          containerNumber: currentContainer,
          releaseLocation: currentReleaseLocation,
          pickupDepot: currentPickupDepot,
          status: currentStatus,
        });
      }
      const ref = subElement(seg[1], "BK");
      if (ref !== null) {
        currentBookingRef = ref;
        // Reset per-container fields
        currentContainer = "";
        currentReleaseLocation = "";
        currentPickupDepot = "";
        currentStatus = "unknown";
      }
    } else if (tag === "EQD") {
      // Flush previous if we already had a container for this booking
      if (currentContainer) {
        records.push({
          bookingRef: currentBookingRef,
          containerNumber: currentContainer,
          releaseLocation: currentReleaseLocation,
          pickupDepot: currentPickupDepot,
          status: currentStatus,
        });
        currentReleaseLocation = "";
        currentPickupDepot = "";
        currentStatus = "unknown";
      }
      const qualifier = seg[1] ?? "";
      if (qualifier === "CN") {
        currentContainer = seg[2]?.split(":")[0] ?? "";
        // EQD+CN+num+type+size+empty/laden — element 5 can be 4=empty, 5=laden
        const statusCode = seg[4]?.split(":")[0] ?? "";
        if (statusCode === "4" || statusCode.toLowerCase() === "empty") {
          currentStatus = "empty";
        } else if (statusCode === "5" || statusCode.toLowerCase() === "laden") {
          currentStatus = "laden";
        }
      }
    } else if (tag === "LOC") {
      const qualifier = seg[1] ?? "";
      const location = firstSubValue(seg[2]);
      if (qualifier === "11") {
        currentReleaseLocation = location;
      } else if (qualifier === "99") {
        currentPickupDepot = location;
      }
    } else if (tag === "FTX") {
      // FTX+AAA+++text — free text can indicate empty/laden
      const text = (seg[4] ?? "").toLowerCase();
      if (text.includes("empty")) {
        currentStatus = "empty";
      } else if (text.includes("laden") || text.includes("full")) {
        currentStatus = "laden";
      }
    }
  }

  // Flush last record
  if (currentContainer) {
    records.push({
      bookingRef: currentBookingRef,
      containerNumber: currentContainer,
      releaseLocation: currentReleaseLocation,
      pickupDepot: currentPickupDepot,
      status: currentStatus,
    });
  }

  return records;
}

// ==========================================
// IFTMIN — Booking Request
// ==========================================

/**
 * Parse IFTMIN (Booking Request) segments.
 *
 * Relevant segments:
 *   NAD+CZ+name — Shipper (consignor)
 *   NAD+CN+name — Consignee
 *   LOC+88+port — Origin port (place of receipt)
 *   LOC+11+port — Destination port (place of delivery)
 *   FTX+AAA+++text — Commodity description
 *   MEA+WT+G+KGM:weight — Gross weight
 *
 * @param segments Pre-split EDIFACT segments
 * @returns Single booking request record
 */
export function parseIftmin(segments: string[][]): IftminRecord {
  const result: IftminRecord = {
    shipper: "",
    consignee: "",
    originPort: "",
    destPort: "",
    commodity: "",
    weight: "",
  };

  for (const seg of segments) {
    const tag = (seg[0] ?? "").substring(0, 3).toUpperCase();

    if (tag === "NAD") {
      const qualifier = seg[1] ?? "";
      // NAD+CZ+id:code:agency++name — name is typically in element 4 (index 4) or element 3
      const name = seg[4] ?? seg[3] ?? seg[2]?.split(":")[0] ?? "";
      if (qualifier === "CZ") {
        result.shipper = name;
      } else if (qualifier === "CN") {
        result.consignee = name;
      }
    } else if (tag === "LOC") {
      const qualifier = seg[1] ?? "";
      const location = firstSubValue(seg[2]);
      if (qualifier === "88") {
        result.originPort = location;
      } else if (qualifier === "11") {
        result.destPort = location;
      }
    } else if (tag === "FTX") {
      const qualifier = seg[1] ?? "";
      if (qualifier === "AAA") {
        // FTX+AAA+++commodity text
        const text = seg[4] ?? seg[3] ?? "";
        if (text) result.commodity = text;
      }
    } else if (tag === "MEA") {
      const qualifier = seg[1] ?? "";
      const measureType = seg[2] ?? "";
      if (qualifier === "WT" || measureType === "WT" || measureType === "G") {
        // MEA+WT+G+KGM:weight or MEA+AAE+WT+KGM:weight
        const valuePart = seg[3] ?? "";
        const weight = valuePart.split(":")[1] ?? valuePart.split(":")[0] ?? "";
        if (weight) result.weight = weight;
      }
    }
  }

  return result;
}

// ==========================================
// CUSCAR — Customs Declaration (Cargo Report)
// ==========================================

/**
 * Parse CUSCAR (Customs Cargo Report) segments.
 *
 * Relevant segments:
 *   RFF+MN:ref — Manifest reference
 *   RFF+BM:num — Bill of Lading number
 *   PAC+count — Package count
 *   CST+hsCode — Customs status / HS code
 *   MEA+WT+G+KGM:weight — Gross weight
 *
 * Each RFF+BM marks a new consignment item.
 *
 * @param segments Pre-split EDIFACT segments
 * @returns Array of customs cargo records
 */
export function parseCuscar(segments: string[][]): CuscarRecord[] {
  const records: CuscarRecord[] = [];
  let currentManifestRef = "";
  let currentBlNumber = "";
  let currentPackages = 0;
  let currentHsCode = "";
  let currentGrossWeight = "";
  let hasActiveItem = false;

  for (const seg of segments) {
    const tag = (seg[0] ?? "").substring(0, 3).toUpperCase();

    if (tag === "RFF") {
      const ref = subElement(seg[1], "MN");
      if (ref !== null) {
        currentManifestRef = ref;
        continue;
      }
      const bl = subElement(seg[1], "BM");
      if (bl !== null) {
        // Flush previous consignment item
        if (hasActiveItem && currentBlNumber) {
          records.push({
            manifestRef: currentManifestRef,
            blNumber: currentBlNumber,
            packages: currentPackages,
            hsCode: currentHsCode,
            grossWeight: currentGrossWeight,
          });
        }
        currentBlNumber = bl;
        currentPackages = 0;
        currentHsCode = "";
        currentGrossWeight = "";
        hasActiveItem = true;
      }
    } else if (tag === "PAC") {
      // PAC+count or PAC+count+type
      const countStr = seg[1] ?? "0";
      const parsed = parseInt(countStr, 10);
      if (!isNaN(parsed)) currentPackages = parsed;
    } else if (tag === "CST") {
      // CST+hsCode or CST+line+hsCode:qualifier
      // Try multiple positions as per CUSCAR variants
      const code = seg[2]?.split(":")[0] ?? seg[1]?.split(":")[0] ?? "";
      if (code) currentHsCode = code;
    } else if (tag === "MEA") {
      const measureType = seg[2] ?? seg[1] ?? "";
      if (measureType === "WT" || measureType === "G" || seg[1] === "WT") {
        const valuePart = seg[3] ?? "";
        const weight = valuePart.split(":")[1] ?? valuePart.split(":")[0] ?? "";
        if (weight) currentGrossWeight = weight;
      }
    }
  }

  // Flush last item
  if (hasActiveItem && currentBlNumber) {
    records.push({
      manifestRef: currentManifestRef,
      blNumber: currentBlNumber,
      packages: currentPackages,
      hsCode: currentHsCode,
      grossWeight: currentGrossWeight,
    });
  }

  return records;
}
