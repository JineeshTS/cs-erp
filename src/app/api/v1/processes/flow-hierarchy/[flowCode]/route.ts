import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  peFlowDefinitions,
  peFlowProcessLinks,
  peProcessDefinitions,
  peProcessTaskLinks,
  peTaskDefinitions,
  peTaskStepDefinitions,
} from "@/db/schema";
import { eq, and, isNull, asc, inArray } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ flowCode: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
      { status: 401 }
    );
  }

  const { flowCode } = await params;

  // 1. Get flow definition
  const [flow] = await db
    .select()
    .from(peFlowDefinitions)
    .where(
      and(
        eq(peFlowDefinitions.flowCode, flowCode),
        isNull(peFlowDefinitions.deletedAt)
      )
    )
    .limit(1);

  if (!flow) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: `Flow ${flowCode} not found` } },
      { status: 404 }
    );
  }

  // 2. Get flow-process links
  const links = await db
    .select()
    .from(peFlowProcessLinks)
    .where(
      and(
        eq(peFlowProcessLinks.flowDefinitionId, flow.id),
        isNull(peFlowProcessLinks.deletedAt)
      )
    )
    .orderBy(asc(peFlowProcessLinks.stepOrder));

  // 3. Get process definitions
  const processIds = links
    .map((l) => l.processDefinitionId)
    .filter((pid): pid is string => pid !== null);

  const processes =
    processIds.length > 0
      ? await db
          .select()
          .from(peProcessDefinitions)
          .where(
            and(
              inArray(peProcessDefinitions.id, processIds),
              isNull(peProcessDefinitions.deletedAt)
            )
          )
      : [];
  const processMap = new Map(processes.map((p) => [p.id, p]));

  // 4. Get process-task links
  const taskLinks =
    processIds.length > 0
      ? await db
          .select()
          .from(peProcessTaskLinks)
          .where(
            and(
              inArray(peProcessTaskLinks.processDefinitionId, processIds),
              isNull(peProcessTaskLinks.deletedAt)
            )
          )
          .orderBy(asc(peProcessTaskLinks.taskOrder))
      : [];

  // 5. Get task definitions
  const taskIds = taskLinks.map((tl) => tl.taskDefinitionId);
  const uniqueTaskIds = [...new Set(taskIds)];

  const tasks =
    uniqueTaskIds.length > 0
      ? await db
          .select()
          .from(peTaskDefinitions)
          .where(
            and(
              inArray(peTaskDefinitions.id, uniqueTaskIds),
              isNull(peTaskDefinitions.deletedAt)
            )
          )
      : [];
  const taskMap = new Map(tasks.map((t) => [t.id, t]));

  // 6. Get step counts per task
  const stepDefs =
    uniqueTaskIds.length > 0
      ? await db
          .select({
            taskDefinitionId: peTaskStepDefinitions.taskDefinitionId,
          })
          .from(peTaskStepDefinitions)
          .where(
            and(
              inArray(peTaskStepDefinitions.taskDefinitionId, uniqueTaskIds),
              isNull(peTaskStepDefinitions.deletedAt)
            )
          )
      : [];

  const stepCounts = new Map<string, number>();
  for (const s of stepDefs) {
    stepCounts.set(s.taskDefinitionId, (stepCounts.get(s.taskDefinitionId) ?? 0) + 1);
  }

  // 7. Group task links by process
  const processTaskMap = new Map<string, typeof taskLinks>();
  for (const tl of taskLinks) {
    const existing = processTaskMap.get(tl.processDefinitionId) ?? [];
    existing.push(tl);
    processTaskMap.set(tl.processDefinitionId, existing);
  }

  // 8. Build response hierarchy
  const result = {
    flowCode: flow.flowCode,
    name: flow.name,
    category: flow.category,
    entityType: flow.entityType,
    triggerEvent: flow.triggerEvent,
    processes: links
      .filter((l) => l.processDefinitionId && processMap.has(l.processDefinitionId))
      .map((l) => {
        const proc = processMap.get(l.processDefinitionId!)!;
        const pTasks = processTaskMap.get(proc.id) ?? [];
        return {
          processCode: proc.processCode,
          name: proc.name,
          stepOrder: l.stepOrder,
          phase: l.phase,
          module: l.module,
          tasks: pTasks.map((tl) => {
            const td = taskMap.get(tl.taskDefinitionId);
            return {
              taskCode: td?.taskCode ?? tl.taskDefinitionId,
              name: td?.name ?? "Unknown Task",
              taskOrder: tl.taskOrder,
              stepCount: stepCounts.get(tl.taskDefinitionId) ?? 0,
            };
          }),
        };
      }),
  };

  return NextResponse.json({ data: result });
}
