/**
 * Seed Script: Migrate hardcoded operational processes + E2E flows
 * into the pe_*_definitions tables as system prebuilt templates.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/seed-definitions.ts
 *
 * Creates:
 * - 316 process definitions (from operational-processes.ts)
 * - Task definitions for each process's steps
 * - Task step definitions for sub-steps
 * - Process-task links
 * - 39 flow definitions (from e2e-process-flows.ts)
 * - Flow-process links (or flow-task links for standalone gates)
 * - Executor configs embedded in task definitions
 */

import postgres from "postgres";
import { OPERATIONAL_PROCESSES } from "../src/data/operational-processes";
import { E2E_PROCESS_FLOWS } from "../src/data/e2e-process-flows";

// Import all executor configs
import { E2E_01_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-01-lead-to-quote";
import { E2E_02_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-02-quote-to-contract";
import { E2E_03_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-03-customer-onboarding";
import { E2E_04_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-04-booking-to-cash";
import { E2E_05_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-05-customer-lifecycle";
import { E2E_06_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-06-revenue-management";
import { E2E_07_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-07-collections-credit";
import { E2E_08_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-08-trade-finance";
import { E2E_09_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-09-import-container";
import { E2E_10_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-10-export-container";
import { E2E_11_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-11-reefer-cargo";
import { E2E_12_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-12-dg-cargo";
import { E2E_13_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-13-transshipment";
import { E2E_14_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-14-oog-special-cargo";
import { E2E_15_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-15-empty-repositioning";
import { E2E_16_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-16-container-leasing";
import { E2E_17_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-17-demurrage-detention";
import { E2E_18_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-18-vessel-voyage";
import { E2E_19_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-19-feeder-voyage";
import { E2E_20_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-20-feeder-connection";
import { E2E_21_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-21-port-call";
import { E2E_22_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-22-charter-party";
import { E2E_23_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-23-vessel-dry-dock";
import { E2E_24_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-24-service-schedule";
import { E2E_25_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-25-financial-month-end";
import { E2E_26_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-26-procure-to-pay";
import { E2E_27_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-27-bunker-procurement";
import { E2E_28_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-28-sanctions-compliance";
import { E2E_29_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-29-maritime-safety";
import { E2E_30_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-30-claims-lifecycle";
import { E2E_31_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-31-esg-reporting";
import { E2E_32_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-32-emergency-salvage";
import { E2E_33_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-33-trade-route-launch";
import { E2E_34_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-34-alliance-vsa";
import { E2E_35_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-35-liner-agency";
import { E2E_36_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-36-nvocc-lcl";
import { E2E_37_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-37-fleet-strategy";
import { E2E_38_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-38-crew-change";
import { E2E_39_STEP_CONFIGS } from "../src/lib/process-engine/executor-configs/e2e-39-platform-admin";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EXECUTOR_CONFIGS: Record<string, Record<number, Record<string, unknown>>> = {
  "E2E-01": E2E_01_STEP_CONFIGS as never,
  "E2E-02": E2E_02_STEP_CONFIGS as never,
  "E2E-03": E2E_03_STEP_CONFIGS as never,
  "E2E-04": E2E_04_STEP_CONFIGS as never,
  "E2E-05": E2E_05_STEP_CONFIGS as never,
  "E2E-06": E2E_06_STEP_CONFIGS as never,
  "E2E-07": E2E_07_STEP_CONFIGS as never,
  "E2E-08": E2E_08_STEP_CONFIGS as never,
  "E2E-09": E2E_09_STEP_CONFIGS as never,
  "E2E-10": E2E_10_STEP_CONFIGS as never,
  "E2E-11": E2E_11_STEP_CONFIGS as never,
  "E2E-12": E2E_12_STEP_CONFIGS as never,
  "E2E-13": E2E_13_STEP_CONFIGS as never,
  "E2E-14": E2E_14_STEP_CONFIGS as never,
  "E2E-15": E2E_15_STEP_CONFIGS as never,
  "E2E-16": E2E_16_STEP_CONFIGS as never,
  "E2E-17": E2E_17_STEP_CONFIGS as never,
  "E2E-18": E2E_18_STEP_CONFIGS as never,
  "E2E-19": E2E_19_STEP_CONFIGS as never,
  "E2E-20": E2E_20_STEP_CONFIGS as never,
  "E2E-21": E2E_21_STEP_CONFIGS as never,
  "E2E-22": E2E_22_STEP_CONFIGS as never,
  "E2E-23": E2E_23_STEP_CONFIGS as never,
  "E2E-24": E2E_24_STEP_CONFIGS as never,
  "E2E-25": E2E_25_STEP_CONFIGS as never,
  "E2E-26": E2E_26_STEP_CONFIGS as never,
  "E2E-27": E2E_27_STEP_CONFIGS as never,
  "E2E-28": E2E_28_STEP_CONFIGS as never,
  "E2E-29": E2E_29_STEP_CONFIGS as never,
  "E2E-30": E2E_30_STEP_CONFIGS as never,
  "E2E-31": E2E_31_STEP_CONFIGS as never,
  "E2E-32": E2E_32_STEP_CONFIGS as never,
  "E2E-33": E2E_33_STEP_CONFIGS as never,
  "E2E-34": E2E_34_STEP_CONFIGS as never,
  "E2E-35": E2E_35_STEP_CONFIGS as never,
  "E2E-36": E2E_36_STEP_CONFIGS as never,
  "E2E-37": E2E_37_STEP_CONFIGS as never,
  "E2E-38": E2E_38_STEP_CONFIGS as never,
  "E2E-39": E2E_39_STEP_CONFIGS as never,
};

const DB_URL =
  process.env.DATABASE_URL ||
  "postgres://codilla:codilla@localhost:5432/cs_erp";

async function main() {
  const sql = postgres(DB_URL);

  console.log("Connecting to database...");
  await sql`SELECT 1`;
  console.log("Connected.\n");

  // Check if already seeded
  const existing =
    await sql`SELECT COUNT(*) as cnt FROM pe_process_definitions WHERE source = 'system'`;
  if (Number(existing[0].cnt) > 0) {
    console.log(
      `Already seeded (${existing[0].cnt} system processes found). To re-seed, run:`
    );
    console.log(
      `  DELETE FROM pe_flow_process_links WHERE tenant_id IS NULL;`
    );
    console.log(
      `  DELETE FROM pe_flow_definitions WHERE source = 'system';`
    );
    console.log(
      `  DELETE FROM pe_process_task_links WHERE tenant_id IS NULL;`
    );
    console.log(
      `  DELETE FROM pe_task_step_definitions WHERE tenant_id IS NULL;`
    );
    console.log(
      `  DELETE FROM pe_task_definitions WHERE source = 'system';`
    );
    console.log(
      `  DELETE FROM pe_process_definitions WHERE source = 'system';`
    );
    await sql.end();
    process.exit(0);
  }

  // ═══════════════════════════════════════════════════════
  // STEP 1: Seed 316 Process Definitions + Task Definitions
  // ═══════════════════════════════════════════════════════
  console.log("═══ STEP 1: Seeding 316 Process Definitions ═══");

  // Map PRC code → process definition UUID for later linking
  const processIdMap = new Map<string, string>();
  // Map PRC code → array of task definition UUIDs
  const processTaskMap = new Map<string, string[]>();

  let taskCounter = 0;
  let taskStepCounter = 0;

  for (const proc of OPERATIONAL_PROCESSES) {
    // Insert process definition
    const [procRow] = await sql`
      INSERT INTO pe_process_definitions (
        tenant_id, process_code, name, description, domain,
        agent_name, agent_type, automation_level, trigger_type,
        input_description, output_description, sla,
        connected_modules, cross_dependencies,
        source, version, is_published
      ) VALUES (
        NULL, ${proc.id}, ${proc.name}, ${proc.description}, ${proc.domain},
        ${proc.agentName}, ${proc.agentType}, ${proc.automationLevel}, ${proc.trigger},
        ${proc.input}, ${proc.output}, ${proc.sla},
        ${JSON.stringify(proc.connectedModules)}, ${JSON.stringify(proc.crossDependencies)},
        'system', 1, true
      ) RETURNING id
    `;
    processIdMap.set(proc.id, procRow.id);

    // Create task definitions from aiProcessingSteps + humanTouchpoints
    const taskIds: string[] = [];
    let order = 1;

    for (const stepText of proc.aiProcessingSteps) {
      const taskCode = `${proc.id}-T${String(order).padStart(2, "0")}`;
      const [taskRow] = await sql`
        INSERT INTO pe_task_definitions (
          tenant_id, task_code, name, description, domain,
          executor_type, executor_mode, ai_assistable,
          source, version, is_published
        ) VALUES (
          NULL, ${taskCode}, ${stepText.substring(0, 200)}, ${stepText}, ${proc.domain},
          'ai_agent', 'ai_with_tools', true,
          'system', 1, true
        ) RETURNING id
      `;
      taskIds.push(taskRow.id);

      // Link task to process
      await sql`
        INSERT INTO pe_process_task_links (
          tenant_id, process_definition_id, task_definition_id,
          task_order, phase
        ) VALUES (
          NULL, ${procRow.id}, ${taskRow.id},
          ${order}, 'AI Processing'
        )
      `;

      taskCounter++;
      order++;
    }

    for (const touchpoint of proc.humanTouchpoints) {
      const taskCode = `${proc.id}-T${String(order).padStart(2, "0")}`;
      const [taskRow] = await sql`
        INSERT INTO pe_task_definitions (
          tenant_id, task_code, name, description, domain,
          executor_type, executor_mode, ai_assistable,
          source, version, is_published
        ) VALUES (
          NULL, ${taskCode}, ${touchpoint.substring(0, 200)}, ${touchpoint}, ${proc.domain},
          'human', 'human_form', true,
          'system', 1, true
        ) RETURNING id
      `;
      taskIds.push(taskRow.id);

      await sql`
        INSERT INTO pe_process_task_links (
          tenant_id, process_definition_id, task_definition_id,
          task_order, phase
        ) VALUES (
          NULL, ${procRow.id}, ${taskRow.id},
          ${order}, 'Human Review'
        )
      `;

      taskCounter++;
      order++;
    }

    processTaskMap.set(proc.id, taskIds);
  }

  console.log(
    `  Inserted ${OPERATIONAL_PROCESSES.length} process definitions`
  );
  console.log(`  Inserted ${taskCounter} task definitions`);

  // ═══════════════════════════════════════════════════════
  // STEP 2: Seed 39 E2E Flow Definitions
  // ═══════════════════════════════════════════════════════
  console.log("\n═══ STEP 2: Seeding 39 E2E Flow Definitions ═══");

  let flowStepTaskCounter = 0;
  let flowLinkCounter = 0;
  let subTaskCounter = 0;

  for (const flow of E2E_PROCESS_FLOWS) {
    // Insert flow definition
    const [flowRow] = await sql`
      INSERT INTO pe_flow_definitions (
        tenant_id, flow_code, name, description, category,
        trigger_event, entity_type,
        participating_modules, ai_agents, handoff_points,
        typical_timeline, kpis, human_gates,
        conditional_branches, child_flows,
        source, version, is_published
      ) VALUES (
        NULL, ${flow.id}, ${flow.name}, ${flow.description}, ${flow.category || null},
        ${flow.triggerEvent || null}, ${flow.entityType || null},
        ${JSON.stringify(flow.participatingModules || [])},
        ${JSON.stringify(flow.aiAgents || [])},
        ${JSON.stringify(flow.handoffPoints || [])},
        ${flow.typicalTimeline || null},
        ${JSON.stringify(flow.kpis || [])},
        ${JSON.stringify(flow.humanGates || [])},
        ${JSON.stringify(flow.conditionalBranches || [])},
        ${JSON.stringify(flow.childFlows || [])},
        'system', 1, true
      ) RETURNING id
    `;

    // Get executor configs for this flow
    const flowConfigs = EXECUTOR_CONFIGS[flow.id] || {};

    // Create flow-process links (or flow-task links for standalone gates)
    for (let i = 0; i < flow.steps.length; i++) {
      const step = flow.steps[i];
      const stepNumber = i + 1;
      const executorConfig = flowConfigs[stepNumber] || null;

      if (step.processRef && processIdMap.has(step.processRef)) {
        // This step maps to a known process definition
        await sql`
          INSERT INTO pe_flow_process_links (
            tenant_id, flow_definition_id,
            process_definition_id, task_definition_id,
            step_order, step_name, phase, module, module_url,
            condition, is_parallel, parallel_group, dependency_refs
          ) VALUES (
            NULL, ${flowRow.id},
            ${processIdMap.get(step.processRef)!}, NULL,
            ${stepNumber}, ${step.step}, ${step.phase || null},
            ${step.module}, ${step.moduleUrl || null},
            ${step.condition || null}, false, NULL,
            ${step.dependencies ? JSON.stringify(step.dependencies) : null}
          )
        `;
      } else {
        // Standalone task (human gate or step without processRef)
        const taskCode = `${flow.id}-S${String(stepNumber).padStart(2, "0")}`;
        const [taskRow] = await sql`
          INSERT INTO pe_task_definitions (
            tenant_id, task_code, name, description, domain,
            executor_type, executor_mode,
            entity_table, entity_action,
            executor_config,
            gate_type, assigned_role, sla_hours,
            ai_assistable,
            input_fields, output_fields, validations,
            source, version, is_published
          ) VALUES (
            NULL, ${taskCode}, ${step.step.substring(0, 200)},
            ${step.description || null}, NULL,
            ${step.executorType || step.type}, ${step.executorMode || (step.gateType ? "gate" : null)},
            ${step.entityTable || null}, ${step.entityAction || null},
            ${executorConfig ? JSON.stringify(executorConfig) : null},
            ${step.gateType || null}, ${step.assignedRole || null},
            ${step.slaHours || null},
            ${step.aiAssistable !== false},
            ${step.inputFields ? JSON.stringify(step.inputFields) : null},
            ${step.outputFields ? JSON.stringify(step.outputFields) : null},
            ${step.validations ? JSON.stringify(step.validations) : null},
            'system', 1, true
          ) RETURNING id
        `;
        flowStepTaskCounter++;

        // Create sub-task step definitions if present
        if (step.subTasks && step.subTasks.length > 0) {
          for (let j = 0; j < step.subTasks.length; j++) {
            const sub = step.subTasks[j];
            await sql`
              INSERT INTO pe_task_step_definitions (
                tenant_id, task_definition_id, step_order,
                name, type, role
              ) VALUES (
                NULL, ${taskRow.id}, ${j + 1},
                ${sub.task.substring(0, 200)}, ${sub.type}, ${sub.role || null}
              )
            `;
            subTaskCounter++;
          }
        }

        await sql`
          INSERT INTO pe_flow_process_links (
            tenant_id, flow_definition_id,
            process_definition_id, task_definition_id,
            step_order, step_name, phase, module, module_url,
            condition, is_parallel, parallel_group, dependency_refs
          ) VALUES (
            NULL, ${flowRow.id},
            NULL, ${taskRow.id},
            ${stepNumber}, ${step.step}, ${step.phase || null},
            ${step.module}, ${step.moduleUrl || null},
            ${step.condition || null}, false, NULL,
            ${step.dependencies ? JSON.stringify(step.dependencies) : null}
          )
        `;
      }

      flowLinkCounter++;
    }

    // Also embed executor configs into process-linked task definitions
    for (const [stepNumStr, config] of Object.entries(flowConfigs)) {
      const stepNum = Number(stepNumStr);
      const step = flow.steps[stepNum - 1];
      if (!step || !step.processRef) continue;

      // Find the task definition for this process step
      const procTasks = processTaskMap.get(step.processRef);
      if (!procTasks || procTasks.length === 0) continue;

      // Embed config in the first task of the process (primary task)
      await sql`
        UPDATE pe_task_definitions
        SET executor_config = ${JSON.stringify(config)},
            entity_table = ${(config as Record<string, unknown>).entityTable as string || null},
            entity_action = ${(config as Record<string, unknown>).entityAction as string || null},
            executor_mode = ${(config as Record<string, unknown>).mode as string || null}
        WHERE id = ${procTasks[0]}
          AND executor_config IS NULL
      `;
    }
  }

  console.log(
    `  Inserted ${E2E_PROCESS_FLOWS.length} flow definitions`
  );
  console.log(
    `  Inserted ${flowStepTaskCounter} standalone task definitions (gates/non-PRC steps)`
  );
  console.log(`  Inserted ${subTaskCounter} task step definitions (sub-tasks)`);
  console.log(`  Inserted ${flowLinkCounter} flow-process/task links`);

  // ═══════════════════════════════════════════════════════
  // STEP 3: Create sub-task step definitions for PRC-linked tasks
  // ═══════════════════════════════════════════════════════
  console.log(
    "\n═══ STEP 3: Seeding sub-task step definitions for E2E flow steps ═══"
  );

  let prcSubTaskCounter = 0;

  for (const flow of E2E_PROCESS_FLOWS) {
    for (let i = 0; i < flow.steps.length; i++) {
      const step = flow.steps[i];
      if (!step.processRef || !step.subTasks || step.subTasks.length === 0)
        continue;

      // Find the first task of this process
      const procTasks = processTaskMap.get(step.processRef);
      if (!procTasks || procTasks.length === 0) continue;

      // Check if sub-tasks already exist for this task
      const existingSubs =
        await sql`SELECT COUNT(*) as cnt FROM pe_task_step_definitions WHERE task_definition_id = ${procTasks[0]}`;
      if (Number(existingSubs[0].cnt) > 0) continue;

      for (let j = 0; j < step.subTasks.length; j++) {
        const sub = step.subTasks[j];
        await sql`
          INSERT INTO pe_task_step_definitions (
            tenant_id, task_definition_id, step_order,
            name, type, role
          ) VALUES (
            NULL, ${procTasks[0]}, ${j + 1},
            ${sub.task.substring(0, 200)}, ${sub.type}, ${sub.role || null}
          )
        `;
        prcSubTaskCounter++;
      }
    }
  }

  console.log(
    `  Inserted ${prcSubTaskCounter} sub-task step definitions for PRC-linked tasks`
  );

  // ═══════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════
  const counts = await sql`
    SELECT
      (SELECT COUNT(*) FROM pe_process_definitions WHERE source = 'system') as processes,
      (SELECT COUNT(*) FROM pe_task_definitions WHERE source = 'system') as tasks,
      (SELECT COUNT(*) FROM pe_task_step_definitions WHERE tenant_id IS NULL) as task_steps,
      (SELECT COUNT(*) FROM pe_process_task_links WHERE tenant_id IS NULL) as proc_task_links,
      (SELECT COUNT(*) FROM pe_flow_definitions WHERE source = 'system') as flows,
      (SELECT COUNT(*) FROM pe_flow_process_links WHERE tenant_id IS NULL) as flow_links
  `;

  console.log("\n═══ SEEDING COMPLETE ═══");
  console.log(`  Process definitions:  ${counts[0].processes}`);
  console.log(`  Task definitions:     ${counts[0].tasks}`);
  console.log(`  Task step definitions: ${counts[0].task_steps}`);
  console.log(`  Process-task links:   ${counts[0].proc_task_links}`);
  console.log(`  Flow definitions:     ${counts[0].flows}`);
  console.log(`  Flow-process links:   ${counts[0].flow_links}`);

  await sql.end();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Seeder failed:", err);
  process.exit(1);
});
