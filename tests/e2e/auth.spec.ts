import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("login page renders with email and password fields", async ({ page }) => {
    await page.goto("/login");

    // Page title / heading
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();

    // Email field
    const emailInput = page.locator("#email");
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute("type", "email");

    // Password field
    const passwordInput = page.locator("#password");
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Submit button
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();

    // Links
    await expect(page.getByRole("link", { name: /forgot your password/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /create account/i })).toBeVisible();
  });

  test("login with valid credentials redirects to dashboard", async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL || "admin@example.com";
    const password = process.env.TEST_USER_PASSWORD || "admin123";

    await page.goto("/login");

    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();

    // Should redirect away from login — either to dashboard or root
    await page.waitForURL((url) => !url.pathname.includes("/login"), {
      timeout: 15_000,
    });

    // Verify we landed on an authenticated page (dashboard or /)
    const currentPath = new URL(page.url()).pathname;
    expect(["/", "/dashboard"]).toContain(currentPath);
  });

  test("login with invalid credentials shows error message", async ({ page }) => {
    await page.goto("/login");

    await page.locator("#email").fill("nonexistent@example.com");
    await page.locator("#password").fill("wrong-password-123");
    await page.getByRole("button", { name: "Sign In" }).click();

    // The error message container with red background
    const errorBanner = page.locator(".bg-red-50");
    await expect(errorBanner).toBeVisible({ timeout: 10_000 });
  });

  test("logout redirects to login page", async ({ page }) => {
    // First, log in
    const email = process.env.TEST_USER_EMAIL || "admin@example.com";
    const password = process.env.TEST_USER_PASSWORD || "admin123";

    await page.goto("/login");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();

    await page.waitForURL((url) => !url.pathname.includes("/login"), {
      timeout: 15_000,
    });

    // Call the logout API directly (the UI logout button may vary)
    const response = await page.request.post("/api/auth/logout");
    expect(response.status()).toBe(200);

    // After logout, navigating to a protected page should redirect to login
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  });
});
