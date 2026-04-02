import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  kmtSopLibraries,
  kmtTrainingModules,
  kmtCompetencyAssessments,
  kmtOnboardingWorkflows,
  kmtKnowledgeAssistants,
  kmtRegulatoryAlerts,
  kmtLessonsLearned,
  kmtVideoLibraries,
} from "@/db/schema";
import { getApiUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth/api-auth";
import { hasPermission } from "@/lib/rbac";
import { eq, and, isNull, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user) return unauthorizedResponse();
    if (!(await hasPermission(user.id, user.tenantId, "kmt:read")))
      return forbiddenResponse();

    const [
      draftSopLibraries,
      draftTrainingModules,
      draftCompetencyAssessments,
      draftOnboardingWorkflows,
      draftKnowledgeAssistants,
      draftRegulatoryAlerts,
      draftLessonsLearned,
      draftVideoLibraries,
    ] = await Promise.all([
      db.select({ value: count() }).from(kmtSopLibraries)
        .where(and(eq(kmtSopLibraries.tenantId, user.tenantId), isNull(kmtSopLibraries.deletedAt), eq(kmtSopLibraries.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(kmtTrainingModules)
        .where(and(eq(kmtTrainingModules.tenantId, user.tenantId), isNull(kmtTrainingModules.deletedAt), eq(kmtTrainingModules.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(kmtCompetencyAssessments)
        .where(and(eq(kmtCompetencyAssessments.tenantId, user.tenantId), isNull(kmtCompetencyAssessments.deletedAt), eq(kmtCompetencyAssessments.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(kmtOnboardingWorkflows)
        .where(and(eq(kmtOnboardingWorkflows.tenantId, user.tenantId), isNull(kmtOnboardingWorkflows.deletedAt), eq(kmtOnboardingWorkflows.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(kmtKnowledgeAssistants)
        .where(and(eq(kmtKnowledgeAssistants.tenantId, user.tenantId), isNull(kmtKnowledgeAssistants.deletedAt), eq(kmtKnowledgeAssistants.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(kmtRegulatoryAlerts)
        .where(and(eq(kmtRegulatoryAlerts.tenantId, user.tenantId), isNull(kmtRegulatoryAlerts.deletedAt), eq(kmtRegulatoryAlerts.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(kmtLessonsLearned)
        .where(and(eq(kmtLessonsLearned.tenantId, user.tenantId), isNull(kmtLessonsLearned.deletedAt), eq(kmtLessonsLearned.status, "draft")))
        .then(([r]) => r.value),
      db.select({ value: count() }).from(kmtVideoLibraries)
        .where(and(eq(kmtVideoLibraries.tenantId, user.tenantId), isNull(kmtVideoLibraries.deletedAt), eq(kmtVideoLibraries.status, "draft")))
        .then(([r]) => r.value),
    ]);

    return NextResponse.json({
      data: {
        draftSopLibraries,
        draftTrainingModules,
        draftCompetencyAssessments,
        draftOnboardingWorkflows,
        draftKnowledgeAssistants,
        draftRegulatoryAlerts,
        draftLessonsLearned,
        draftVideoLibraries,
      },
    });
  } catch (error) {
    console.error("Failed to get Knowledge Management & Training hub:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
