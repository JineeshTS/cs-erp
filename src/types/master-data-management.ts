import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  ports,
  terminals,
  vessels,
  commodities,
  containerTypes,
  customers,
  tariffCodes,
  exchangeRates,
  glAccounts,
  costCentres,
} from "@/db/schema/master-data-management";

// Port & Terminal
export type Port = InferSelectModel<typeof ports>;
export type NewPort = InferInsertModel<typeof ports>;
export type Terminal = InferSelectModel<typeof terminals>;
export type NewTerminal = InferInsertModel<typeof terminals>;

// Vessel
export type Vessel = InferSelectModel<typeof vessels>;
export type NewVessel = InferInsertModel<typeof vessels>;

// Commodity
export type Commodity = InferSelectModel<typeof commodities>;
export type NewCommodity = InferInsertModel<typeof commodities>;

// Container Type
export type ContainerType = InferSelectModel<typeof containerTypes>;
export type NewContainerType = InferInsertModel<typeof containerTypes>;

// Customer
export type Customer = InferSelectModel<typeof customers>;
export type NewCustomer = InferInsertModel<typeof customers>;

// Tariff Code
export type TariffCode = InferSelectModel<typeof tariffCodes>;
export type NewTariffCode = InferInsertModel<typeof tariffCodes>;

// Exchange Rate
export type ExchangeRate = InferSelectModel<typeof exchangeRates>;
export type NewExchangeRate = InferInsertModel<typeof exchangeRates>;

// GL Account & Cost Centre
export type GlAccount = InferSelectModel<typeof glAccounts>;
export type NewGlAccount = InferInsertModel<typeof glAccounts>;
export type CostCentre = InferSelectModel<typeof costCentres>;
export type NewCostCentre = InferInsertModel<typeof costCentres>;

// Common types
export type MdmEntityType =
  | "ports"
  | "terminals"
  | "vessels"
  | "commodities"
  | "container-types"
  | "customers"
  | "tariffs"
  | "exchange-rates"
  | "gl-accounts"
  | "cost-centres";

export interface MdmListParams {
  tenantId: string;
  search?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}

export interface MdmListResult<T> {
  data: T[];
  meta: {
    cursor?: string;
    hasMore: boolean;
  };
}
