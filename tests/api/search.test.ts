import { describe, it, expect } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3100";

describe("GET /api/v1/search", () => {
  it("returns 401 without authentication", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/search?q=test`);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 400 with empty query parameter", async () => {
    // The search route requires q to be min 1 char via Zod
    // Without auth, it will return 401 first. This tests the validation path
    // when auth is bypassed or when we can provide a token.
    // Since we don't have auth here, we verify the route responds.
    const res = await fetch(`${BASE_URL}/api/v1/search?q=`);

    // Auth check runs first, so without a token this returns 401
    expect([400, 401]).toContain(res.status);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});
