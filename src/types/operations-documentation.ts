import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  odmBillsOfLading,
  odmBlContainers,
  odmBlCharges,
  odmManifests,
  odmManifestItems,
  odmRegulatoryFilings,
  odmVgmRecords,
  odmShippingInstructions,
  odmCargoTrackingEvents,
  odmDocumentAmendments,
} from "@/db/schema";

export type BillOfLading = InferSelectModel<typeof odmBillsOfLading>;
export type NewBillOfLading = InferInsertModel<typeof odmBillsOfLading>;

export type BlContainer = InferSelectModel<typeof odmBlContainers>;
export type NewBlContainer = InferInsertModel<typeof odmBlContainers>;

export type BlCharge = InferSelectModel<typeof odmBlCharges>;
export type NewBlCharge = InferInsertModel<typeof odmBlCharges>;

export type Manifest = InferSelectModel<typeof odmManifests>;
export type NewManifest = InferInsertModel<typeof odmManifests>;

export type ManifestItem = InferSelectModel<typeof odmManifestItems>;
export type NewManifestItem = InferInsertModel<typeof odmManifestItems>;

export type RegulatoryFiling = InferSelectModel<typeof odmRegulatoryFilings>;
export type NewRegulatoryFiling = InferInsertModel<typeof odmRegulatoryFilings>;

export type VgmRecord = InferSelectModel<typeof odmVgmRecords>;
export type NewVgmRecord = InferInsertModel<typeof odmVgmRecords>;

export type ShippingInstruction = InferSelectModel<typeof odmShippingInstructions>;
export type NewShippingInstruction = InferInsertModel<typeof odmShippingInstructions>;

export type CargoTrackingEvent = InferSelectModel<typeof odmCargoTrackingEvents>;
export type NewCargoTrackingEvent = InferInsertModel<typeof odmCargoTrackingEvents>;

export type DocumentAmendment = InferSelectModel<typeof odmDocumentAmendments>;
export type NewDocumentAmendment = InferInsertModel<typeof odmDocumentAmendments>;
