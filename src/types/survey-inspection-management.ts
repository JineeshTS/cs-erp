import type {
  simCargoSurveys,
  simContainerSurveys,
  simDraftSurveys,
  simHireSurveys,
  simHatchInspections,
  simReeferPtiSurveys,
  simClassificationSurveys,
  simSurveyReports,
} from "@/db/schema";

export type SimCargoSurvey = typeof simCargoSurveys.$inferSelect;
export type NewSimCargoSurvey = typeof simCargoSurveys.$inferInsert;

export type SimContainerSurvey = typeof simContainerSurveys.$inferSelect;
export type NewSimContainerSurvey = typeof simContainerSurveys.$inferInsert;

export type SimDraftSurvey = typeof simDraftSurveys.$inferSelect;
export type NewSimDraftSurvey = typeof simDraftSurveys.$inferInsert;

export type SimHireSurvey = typeof simHireSurveys.$inferSelect;
export type NewSimHireSurvey = typeof simHireSurveys.$inferInsert;

export type SimHatchInspection = typeof simHatchInspections.$inferSelect;
export type NewSimHatchInspection = typeof simHatchInspections.$inferInsert;

export type SimReeferPtiSurvey = typeof simReeferPtiSurveys.$inferSelect;
export type NewSimReeferPtiSurvey = typeof simReeferPtiSurveys.$inferInsert;

export type SimClassificationSurvey = typeof simClassificationSurveys.$inferSelect;
export type NewSimClassificationSurvey = typeof simClassificationSurveys.$inferInsert;

export type SimSurveyReport = typeof simSurveyReports.$inferSelect;
export type NewSimSurveyReport = typeof simSurveyReports.$inferInsert;
