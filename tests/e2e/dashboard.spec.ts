import { test, expect } from "@playwright/test";

/**
 * Helper: log in before each test in this file.
 * Uses env vars or falls back to default test credentials.
 */
async function login(page: import("@playwright/test").Page) {
  const email = process.env.TEST_USER_EMAIL || "admin@codilla.ai";
  const password = process.env.TEST_USER_PASSWORD || "admin123";

  await page.goto("/login");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();

  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15_000,
  });
}

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("dashboard loads with KPI cards", async ({ page }) => {
    await page.goto("/dashboard");

    // Wait for the dashboard heading
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({
      timeout: 15_000,
    });

    // Verify KPI stat cards are rendered (the dashboard has 8 cards)
    const kpiTitles = [
      "Active Vessels",
      "Open Bookings",
      "Containers in Transit",
      "Pending Customs",
      "Revenue MTD",
      "Outstanding AR",
      "Active Processes",
      "Pending Approvals",
    ];

    for (const title of kpiTitles) {
      await expect(page.getByText(title, { exact: true })).toBeVisible();
    }
  });

  test("navigation sidebar is visible and has links", async ({ page }) => {
    await page.goto("/dashboard");

    // The sidebar should be present (rendered as <aside>)
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();

    // Sidebar should contain at least one navigation link
    const navLinks = sidebar.getByRole("link");
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test("search command palette opens on Cmd+K", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({
      timeout: 15_000,
    });

    // Press Cmd+K (Meta+K) to open the command palette
    await page.keyboard.press("Meta+k");

    // The command palette should appear with a search input
    const searchInput = page.locator('input[placeholder*="Search"]').or(
      page.locator('[role="dialog"] input[type="text"]')
    );
    await expect(searchInput).toBeVisible({ timeout: 5_000 });
  });
});
