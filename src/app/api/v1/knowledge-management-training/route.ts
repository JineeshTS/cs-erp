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
import { eq, and, isNull } from "drizzle-orm";

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
      db.select({ id: kmtSopLibraries.id }).from(kmtSopLibraries)
        .where(and(eq(kmtSopLibraries.tenantId, user.tenantId), isNull(kmtSopLibraries.deletedAt), eq(kmtSopLibraries.status, "draft")))
        .then((r) => r.length),
      db.select({ id: kmtTrainingModules.id }).from(kmtTrainingModules)
        .where(and(eq(kmtTrainingModules.tenantId, user.tenantId), isNull(kmtTrainingModules.deletedAt), eq(kmtTrainingModules.status, "draft")))
        .then((r) => r.length),
      db.select({ id: kmtCompetencyAssessments.id }).from(kmtCompetencyAssessments)
        .where(and(eq(kmtCompetencyAssessments.tenantId, user.tenantId), isNull(kmtCompetencyAssessments.deletedAt), eq(kmtCompetencyAssessments.status, "draft")))
        .then((r) => r.length),
      db.select({ id: kmtOnboardingWorkflows.id }).from(kmtOnboardingWorkflows)
        .where(and(eq(kmtOnboardingWorkflows.tenantId, user.tenantId), isNull(kmtOnboardingWorkflows.deletedAt), eq(kmtOnboardingWorkflows.status, "draft")))
        .then((r) => r.length),
      db.select({ id: kmtKnowledgeAssistants.id }).from(kmtKnowledgeAssistants)
        .where(and(eq(kmtKnowledgeAssistants.tenantId, user.tenantId), isNull(kmtKnowledgeAssistants.deletedAt), eq(kmtKnowledgeAssistants.status, "draft")))
        .then((r) => r.length),
      db.select({ id: kmtRegulatoryAlerts.id }).from(kmtRegulatoryAlerts)
        .where(and(eq(kmtRegulatoryAlerts.tenantId, user.tenantId), isNull(kmtRegulatoryAlerts.deletedAt), eq(kmtRegulatoryAlerts.status, "draft")))
        .then((r) => r.length),
      db.select({ id: kmtLessonsLearned.id }).from(kmtLessonsLearned)
        .where(and(eq(kmtLessonsLearned.tenantId, user.tenantId), isNull(kmtLessonsLearned.deletedAt), eq(kmtLessonsLearned.status, "draft")))
        .then((r) => r.length),
      db.select({ id: kmtVideoLibraries.id }).from(kmtVideoLibraries)
        .where(and(eq(kmtVideoLibraries.tenantId, user.tenantId), isNull(kmtVideoLibraries.deletedAt), eq(kmtVideoLibraries.status, "draft")))
        .then((r) => r.length),
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
