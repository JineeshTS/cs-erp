import { describe, it, expect, vi } from "vitest";

/**
 * Tests for currency conversion logic.
 *
 * The actual convertCurrency and autoConvertToBaseCurrency functions require
 * a live database connection. Here we test the core logic patterns by mocking
 * the DB layer.
 */

// Mock the db module before importing the currency module
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
  },
}));

// Mock the schema module
vi.mock("@/db/schema", () => ({
  exchangeRates: {
    tenantId: "tenantId",
    baseCurrency: "baseCurrency",
    targetCurrency: "targetCurrency",
    effectiveDate: "effectiveDate",
    validUntil: "validUntil",
    deletedAt: "deletedAt",
    rate: "rate",
  },
  tenants: {
    id: "id",
    currency: "currency",
  },
}));

describe("autoConvertToBaseCurrency — same currency skip", () => {
  it("skips conversion when source currency matches base currency", async () => {
    // Import after mocks are set up
    const { autoConvertToBaseCurrency } = await import("@/lib/engines/currency");

    // Mock db to return tenant with USD as base currency
    const { db } = await import("@/lib/db");
    const mockSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ currency: "USD" }]),
        }),
      }),
    });
    (db as unknown as Record<string, unknown>).select = mockSelect;

    const result = await autoConvertToBaseCurrency(
      "tenant-123",
      1000,
      "USD"
    );

    expect(result.baseCurrencyAmount).toBe(1000);
    expect(result.baseCurrency).toBe("USD");
    expect(result.exchangeRate).toBe(1);
  });
});

describe("convertCurrency — same currency", () => {
  it("returns original amount with rate 1 when currencies are the same", async () => {
    const { convertCurrency } = await import("@/lib/engines/currency");

    const result = await convertCurrency(500, "QAR", "QAR", "tenant-123");

    expect(result.convertedAmount).toBe(500);
    expect(result.exchangeRate).toBe(1);
    expect(result.source).toBe("direct");
  });
});
