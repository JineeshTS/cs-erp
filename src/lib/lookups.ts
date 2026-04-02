import { db } from "@/lib/db";
import { ports, customers, vessels, containerTypes, commodities, terminals } from "@/db/schema";
import { eq, and, isNull, asc } from "drizzle-orm";

/** Active ports for tenant → select options. */
export async function getPortOptions(tenantId: string) {
  const rows = await db
    .select({ id: ports.id, unLocode: ports.unLocode, name: ports.name })
    .from(ports)
    .where(and(eq(ports.tenantId, tenantId), eq(ports.status, "active"), isNull(ports.deletedAt)))
    .orderBy(asc(ports.name))
    .limit(50);
  return rows.map((r) => ({ value: r.id, label: `${r.name} (${r.unLocode})` }));
}

/** Active customers for tenant → select options. */
export async function getCustomerOptions(tenantId: string) {
  const rows = await db
    .select({ id: customers.id, name: customers.name, shortName: customers.shortName })
    .from(customers)
    .where(and(eq(customers.tenantId, tenantId), eq(customers.status, "active"), isNull(customers.deletedAt)))
    .orderBy(asc(customers.name))
    .limit(50);
  return rows.map((r) => ({ value: r.id, label: r.shortName ? `${r.name} (${r.shortName})` : r.name }));
}

/** Active vessels for tenant → select options. */
export async function getVesselOptions(tenantId: string) {
  const rows = await db
    .select({ id: vessels.id, name: vessels.name, imoNumber: vessels.imoNumber })
    .from(vessels)
    .where(and(eq(vessels.tenantId, tenantId), eq(vessels.status, "active"), isNull(vessels.deletedAt)))
    .orderBy(asc(vessels.name))
    .limit(50);
  return rows.map((r) => ({ value: r.id, label: `${r.name} (IMO ${r.imoNumber})` }));
}

/** Active container types for tenant → select options. */
export async function getContainerTypeOptions(tenantId: string) {
  const rows = await db
    .select({ isoCode: containerTypes.isoCode, description: containerTypes.description })
    .from(containerTypes)
    .where(and(eq(containerTypes.tenantId, tenantId), eq(containerTypes.status, "active"), isNull(containerTypes.deletedAt)))
    .orderBy(asc(containerTypes.isoCode))
    .limit(50);
  return rows.map((r) => ({ value: r.isoCode, label: `${r.isoCode} — ${r.description}` }));
}

/** Active commodities for tenant → select options. */
export async function getCommodityOptions(tenantId: string) {
  const rows = await db
    .select({ hsCode: commodities.hsCode, description: commodities.description })
    .from(commodities)
    .where(and(eq(commodities.tenantId, tenantId), eq(commodities.status, "active"), isNull(commodities.deletedAt)))
    .orderBy(asc(commodities.hsCode))
    .limit(50);
  return rows.map((r) => ({ value: r.hsCode, label: `${r.hsCode} — ${r.description}` }));
}

/** Active terminals for tenant → select options. */
export async function getTerminalOptions(tenantId: string) {
  const rows = await db
    .select({ id: terminals.id, name: terminals.name, code: terminals.code })
    .from(terminals)
    .where(and(eq(terminals.tenantId, tenantId), eq(terminals.status, "active"), isNull(terminals.deletedAt)))
    .orderBy(asc(terminals.name))
    .limit(50);
  return rows.map((r) => ({ value: r.code || r.id, label: r.code ? `${r.name} (${r.code})` : r.name }));
}

/** Hardcoded ISO 4217 currency options (shipping-relevant subset). */
export function getCurrencyOptions() {
  return [
    { value: "USD", label: "USD — US Dollar" },
    { value: "EUR", label: "EUR — Euro" },
    { value: "GBP", label: "GBP — British Pound" },
    { value: "AED", label: "AED — UAE Dirham" },
    { value: "SAR", label: "SAR — Saudi Riyal" },
    { value: "QAR", label: "QAR — Qatari Riyal" },
    { value: "INR", label: "INR — Indian Rupee" },
    { value: "SGD", label: "SGD — Singapore Dollar" },
    { value: "CNY", label: "CNY — Chinese Yuan" },
    { value: "JPY", label: "JPY — Japanese Yen" },
    { value: "KRW", label: "KRW — Korean Won" },
    { value: "MYR", label: "MYR — Malaysian Ringgit" },
    { value: "THB", label: "THB — Thai Baht" },
    { value: "IDR", label: "IDR — Indonesian Rupiah" },
    { value: "BHD", label: "BHD — Bahraini Dinar" },
    { value: "KWD", label: "KWD — Kuwaiti Dinar" },
    { value: "OMR", label: "OMR — Omani Rial" },
    { value: "NOK", label: "NOK — Norwegian Krone" },
    { value: "CHF", label: "CHF — Swiss Franc" },
    { value: "ZAR", label: "ZAR — South African Rand" },
  ];
}

/** Hardcoded ISO 3166-1 alpha-2 country options (shipping-relevant subset). */
export function getCountryOptions() {
  return [
    { value: "AE", label: "AE — United Arab Emirates" },
    { value: "BH", label: "BH — Bahrain" },
    { value: "CN", label: "CN — China" },
    { value: "DE", label: "DE — Germany" },
    { value: "EG", label: "EG — Egypt" },
    { value: "FR", label: "FR — France" },
    { value: "GB", label: "GB — United Kingdom" },
    { value: "GR", label: "GR — Greece" },
    { value: "HK", label: "HK — Hong Kong" },
    { value: "ID", label: "ID — Indonesia" },
    { value: "IN", label: "IN — India" },
    { value: "JP", label: "JP — Japan" },
    { value: "KR", label: "KR — South Korea" },
    { value: "KW", label: "KW — Kuwait" },
    { value: "LK", label: "LK — Sri Lanka" },
    { value: "MY", label: "MY — Malaysia" },
    { value: "NL", label: "NL — Netherlands" },
    { value: "NO", label: "NO — Norway" },
    { value: "OM", label: "OM — Oman" },
    { value: "PH", label: "PH — Philippines" },
    { value: "PK", label: "PK — Pakistan" },
    { value: "QA", label: "QA — Qatar" },
    { value: "SA", label: "SA — Saudi Arabia" },
    { value: "SG", label: "SG — Singapore" },
    { value: "TH", label: "TH — Thailand" },
    { value: "TR", label: "TR — Turkey" },
    { value: "TW", label: "TW — Taiwan" },
    { value: "US", label: "US — United States" },
    { value: "VN", label: "VN — Vietnam" },
    { value: "ZA", label: "ZA — South Africa" },
  ];
}
