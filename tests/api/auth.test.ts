import { describe, it, expect } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3100";

describe("POST /api/auth/login", () => {
  it("returns 400 when body is not valid JSON", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe("BAD_REQUEST");
  });

  it("returns 422 when body is empty object (missing fields)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    // Zod validation will fail — returns 422 VALIDATION_ERROR
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 401 with invalid credentials", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "nobody@example.com",
        password: "definitely-wrong-password",
      }),
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe("UNAUTHORIZED");
    expect(body.error.message).toBe("Invalid email or password");
  });
});

describe("GET /api/auth/me", () => {
  it("returns 401 without authentication token", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe("UNAUTHORIZED");
  });
});
