import { describe, it, expect } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3100";

describe("GET /api/health", () => {
  it("returns 200 with status ok and version", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("status");
    expect(["ok", "degraded"]).toContain(body.status);
    expect(body).toHaveProperty("version");
    expect(typeof body.version).toBe("string");
    expect(body).toHaveProperty("timestamp");
  });
});
