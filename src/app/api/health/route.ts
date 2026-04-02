import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import packageJson from "../../../../package.json";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({
      status: "ok",
      version: packageJson.version,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status: "degraded", version: packageJson.version, timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
