import type {
  kmtSopLibraries,
  kmtTrainingModules,
  kmtCompetencyAssessments,
  kmtOnboardingWorkflows,
  kmtKnowledgeAssistants,
  kmtRegulatoryAlerts,
  kmtLessonsLearned,
  kmtVideoLibraries,
} from "@/db/schema";

export type KmtSopLibrary = typeof kmtSopLibraries.$inferSelect;
export type NewKmtSopLibrary = typeof kmtSopLibraries.$inferInsert;

export type KmtTrainingModule = typeof kmtTrainingModules.$inferSelect;
export type NewKmtTrainingModule = typeof kmtTrainingModules.$inferInsert;

export type KmtCompetencyAssessment = typeof kmtCompetencyAssessments.$inferSelect;
export type NewKmtCompetencyAssessment = typeof kmtCompetencyAssessments.$inferInsert;

export type KmtOnboardingWorkflow = typeof kmtOnboardingWorkflows.$inferSelect;
export type NewKmtOnboardingWorkflow = typeof kmtOnboardingWorkflows.$inferInsert;

export type KmtKnowledgeAssistant = typeof kmtKnowledgeAssistants.$inferSelect;
export type NewKmtKnowledgeAssistant = typeof kmtKnowledgeAssistants.$inferInsert;

export type KmtRegulatoryAlert = typeof kmtRegulatoryAlerts.$inferSelect;
export type NewKmtRegulatoryAlert = typeof kmtRegulatoryAlerts.$inferInsert;

export type KmtLessonLearned = typeof kmtLessonsLearned.$inferSelect;
export type NewKmtLessonLearned = typeof kmtLessonsLearned.$inferInsert;

export type KmtVideoLibrary = typeof kmtVideoLibraries.$inferSelect;
export type NewKmtVideoLibrary = typeof kmtVideoLibraries.$inferInsert;
