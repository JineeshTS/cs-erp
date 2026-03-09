/**
 * AIS Provider Abstraction — fetches vessel positions from external AIS APIs.
 * Currently supports VesselFinder API v2.
 * Tenant API key stored in tenant metadata: { aisProvider, aisApiKey }.
 */

export interface AisPosition {
  imo: string;
  mmsi: string;
  vesselName: string;
  latitude: number;
  longitude: number;
  courseOverGround: number;
  speedOverGround: number;
  navStatus: string;
  destination: string;
  eta: string | null;
  draught: number | null;
}

interface VesselFinderResponse {
  AIS: Array<{
    IMO: number;
    MMSI: number;
    NAME: string;
    LATITUDE: number;
    LONGITUDE: number;
    COURSE: number;
    SPEED: number;
    NAVSTAT: number;
    DESTINATION: string;
    ETA: string;
    DRAUGHT: number;
  }>;
}

const NAV_STATUS_MAP: Record<number, string> = {
  0: "Under way using engine",
  1: "At anchor",
  2: "Not under command",
  3: "Restricted manoeuvrability",
  4: "Constrained by draught",
  5: "Moored",
  6: "Aground",
  7: "Engaged in fishing",
  8: "Under way sailing",
  9: "Reserved (HSC)",
  10: "Reserved (WIG)",
  11: "Power-driven towing astern",
  12: "Power-driven pushing/towing",
  14: "AIS-SART active",
  15: "Not defined",
};

export async function fetchVesselFinderPositions(
  apiKey: string,
  imoNumbers: string[]
): Promise<{ positions: AisPosition[]; errors: string[] }> {
  if (imoNumbers.length === 0) {
    return { positions: [], errors: [] };
  }

  const positions: AisPosition[] = [];
  const errors: string[] = [];

  // VesselFinder API allows up to 20 IMOs per call
  const chunks = chunkArray(imoNumbers, 20);

  for (const chunk of chunks) {
    const imoParam = chunk.join(",");
    const url = `https://api.vesselfinder.com/vessels?userkey=${encodeURIComponent(apiKey)}&imo=${imoParam}`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeout);

      if (res.status === 429) {
        errors.push("VesselFinder rate limit exceeded. Try again later.");
        continue;
      }

      if (res.status === 401 || res.status === 403) {
        errors.push("Invalid VesselFinder API key.");
        continue;
      }

      if (!res.ok) {
        errors.push(`VesselFinder API error: HTTP ${res.status}`);
        continue;
      }

      const data: VesselFinderResponse = await res.json();

      if (data.AIS) {
        for (const v of data.AIS) {
          positions.push({
            imo: String(v.IMO),
            mmsi: String(v.MMSI),
            vesselName: v.NAME,
            latitude: v.LATITUDE,
            longitude: v.LONGITUDE,
            courseOverGround: v.COURSE,
            speedOverGround: v.SPEED / 10, // VesselFinder returns speed in 1/10 knots
            navStatus: NAV_STATUS_MAP[v.NAVSTAT] || `Unknown (${v.NAVSTAT})`,
            destination: v.DESTINATION || "",
            eta: v.ETA || null,
            draught: v.DRAUGHT ? v.DRAUGHT / 10 : null,
          });
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        errors.push("VesselFinder API timeout (10s).");
      } else {
        errors.push("VesselFinder network error.");
      }
    }
  }

  return { positions, errors };
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
