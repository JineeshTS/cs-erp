import type {
  mecAnnexCompliances,
  mecBallastWaters,
  mecAntiFoulings,
  mecWasteManagements,
  mecSulphurCaps,
  mecCiiRatings,
  mecCargoCharters,
  mecEnvironmentalIncidents,
} from "@/db/schema";

export type MecAnnexCompliance = typeof mecAnnexCompliances.$inferSelect;
export type NewMecAnnexCompliance = typeof mecAnnexCompliances.$inferInsert;

export type MecBallastWater = typeof mecBallastWaters.$inferSelect;
export type NewMecBallastWater = typeof mecBallastWaters.$inferInsert;

export type MecAntiFouling = typeof mecAntiFoulings.$inferSelect;
export type NewMecAntiFouling = typeof mecAntiFoulings.$inferInsert;

export type MecWasteManagement = typeof mecWasteManagements.$inferSelect;
export type NewMecWasteManagement = typeof mecWasteManagements.$inferInsert;

export type MecSulphurCap = typeof mecSulphurCaps.$inferSelect;
export type NewMecSulphurCap = typeof mecSulphurCaps.$inferInsert;

export type MecCiiRating = typeof mecCiiRatings.$inferSelect;
export type NewMecCiiRating = typeof mecCiiRatings.$inferInsert;

export type MecCargoCharter = typeof mecCargoCharters.$inferSelect;
export type NewMecCargoCharter = typeof mecCargoCharters.$inferInsert;

export type MecEnvironmentalIncident = typeof mecEnvironmentalIncidents.$inferSelect;
export type NewMecEnvironmentalIncident = typeof mecEnvironmentalIncidents.$inferInsert;
