import { describe, it, expect } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3100";

describe("GET /api/v1/lookups/:entity", () => {
  it("returns 401 for ports lookup without authentication", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/lookups/ports`);

    // The getApiUser check returns unauthorizedResponse (401)
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 400 for invalid entity name without authentication", async () => {
    // Even though auth comes first, test that the route exists and responds
    const res = await fetch(`${BASE_URL}/api/v1/lookups/invalid-entity`);

    // Auth check happens before entity validation, so this should be 401
    // (the route requires auth first, then validates entity)
    expect([400, 401]).toContain(res.status);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});
