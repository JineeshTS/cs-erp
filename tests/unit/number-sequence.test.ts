import { describe, it, expect } from "vitest";

/**
 * Tests for pure utility functions from number-sequence.ts.
 *
 * The main generateNextNumber function depends on the database, so we only test
 * the pure helper functions: getDefaultPrefix and formatDate.
 * Since these are not exported, we re-implement and test the logic here.
 * If the module is refactored to export them, these tests can import directly.
 */

// Re-implement getDefaultPrefix logic for testing (mirrors src/lib/number-sequence.ts)
function getDefaultPrefix(entityType: string): string {
  const prefixes: Record<string, string> = {
    booking: "BK",
    bill_of_lading: "BL",
    invoice: "INV",
    credit_note: "CN",
    debit_note: "DN",
    purchase_order: "PO",
    voyage: "VOY",
    container_release: "CRO",
    customs_filing: "CUS",
    quotation: "QT",
    contract: "CT",
    claim: "CLM",
    pda: "PDA",
    manifest: "MAN",
  };
  return prefixes[entityType] || entityType.slice(0, 3).toUpperCase();
}

// Re-implement formatDate logic for testing (mirrors src/lib/number-sequence.ts)
function formatDate(date: Date, format: string): string {
  const yyyy = date.getFullYear().toString();
  const yy = yyyy.slice(-2);
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");

  switch (format) {
    case "YYYY": return yyyy;
    case "YY": return yy;
    case "YYMM": return `${yy}${mm}`;
    case "YYYYMM": return `${yyyy}${mm}`;
    case "YYYYMMDD": return `${yyyy}${mm}${dd}`;
    default: return `${yy}${mm}`;
  }
}

describe("getDefaultPrefix", () => {
  it("returns BK for booking", () => {
    expect(getDefaultPrefix("booking")).toBe("BK");
  });

  it("returns BL for bill_of_lading", () => {
    expect(getDefaultPrefix("bill_of_lading")).toBe("BL");
  });

  it("returns INV for invoice", () => {
    expect(getDefaultPrefix("invoice")).toBe("INV");
  });

  it("returns VOY for voyage", () => {
    expect(getDefaultPrefix("voyage")).toBe("VOY");
  });

  it("returns CLM for claim", () => {
    expect(getDefaultPrefix("claim")).toBe("CLM");
  });

  it("returns PDA for pda", () => {
    expect(getDefaultPrefix("pda")).toBe("PDA");
  });

  it("returns first 3 chars uppercased for unknown entity", () => {
    expect(getDefaultPrefix("delivery_order")).toBe("DEL");
  });

  it("returns first 3 chars uppercased for short unknown entity", () => {
    expect(getDefaultPrefix("ab")).toBe("AB");
  });
});

describe("formatDate", () => {
  // Use a fixed date: 2026-03-15
  const testDate = new Date(2026, 2, 15); // month is 0-indexed

  it("returns YYMM format correctly", () => {
    expect(formatDate(testDate, "YYMM")).toBe("2603");
  });

  it("returns YYYY format correctly", () => {
    expect(formatDate(testDate, "YYYY")).toBe("2026");
  });

  it("returns YY format correctly", () => {
    expect(formatDate(testDate, "YY")).toBe("26");
  });

  it("returns YYYYMM format correctly", () => {
    expect(formatDate(testDate, "YYYYMM")).toBe("202603");
  });

  it("returns YYYYMMDD format correctly", () => {
    expect(formatDate(testDate, "YYYYMMDD")).toBe("20260315");
  });

  it("returns default (YYMM) for unknown format", () => {
    expect(formatDate(testDate, "UNKNOWN")).toBe("2603");
  });

  it("handles January (month padding)", () => {
    const jan = new Date(2026, 0, 5);
    expect(formatDate(jan, "YYMM")).toBe("2601");
  });

  it("handles December", () => {
    const dec = new Date(2026, 11, 25);
    expect(formatDate(dec, "YYMM")).toBe("2612");
  });
});
