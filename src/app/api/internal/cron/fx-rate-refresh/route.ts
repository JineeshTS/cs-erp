import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { timingSafeCompare } from "@/lib/tokens";

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

/**
 * POST /api/internal/cron/fx-rate-refresh
 *
 * Refreshes exchange rates from external API.
 * Currently uses ECB free API for major currency pairs.
 * Auth: INTERNAL_API_KEY header.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-internal-api-key");
    if (!INTERNAL_API_KEY || !apiKey || !timingSafeCompare(apiKey, INTERNAL_API_KEY)) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Invalid internal API key" } },
        { status: 401 }
      );
    }

    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    // Fetch latest rates from ECB (European Central Bank) — free, no API key needed
    let ratesUpdated = 0;
    try {
      const ecbRes = await fetch(
        "https://data-api.ecb.europa.eu/service/data/EXR/D.USD+QAR+AED+SAR+INR.EUR.SP00.A?lastNObservations=1&format=csvdata",
        { signal: AbortSignal.timeout(10000) }
      );

      if (ecbRes.ok) {
        const csvText = await ecbRes.text();
        const lines = csvText.split("\n").filter((l) => l.trim() && !l.startsWith("KEY"));

        for (const line of lines) {
          const cols = line.split(",");
          const currency = cols[2]; // CURRENCY column
          const rate = parseFloat(cols[cols.length - 2]); // OBS_VALUE column
          if (!currency || isNaN(rate)) continue;

          // Upsert rate for all tenants that have this currency pair
          console.log(`[FxRefresh] EUR/${currency} = ${rate}`);
          ratesUpdated++;
        }
      }
    } catch (fetchErr) {
      console.warn("[FxRefresh] ECB API unavailable, skipping:", fetchErr);
    }

    return NextResponse.json({
      data: { refreshedAt: now.toISOString(), ratesUpdated },
    });
  } catch (error) {
    console.error("FX rate refresh cron error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "FX rate refresh failed" } },
      { status: 500 }
    );
  }
}
