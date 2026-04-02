/**
 * Entity Step Executor — CRUD Mode (D-006 Phase 2)
 *
 * Executes flow steps that create/update real database entities.
 * Uses config-driven field mappings to transform step input into DB columns.
 * Calls Drizzle ORM directly — no AI, no HTTP, fast and reliable.
 *
 * Returns the real entity_id and a data snapshot for the binding.
 */

import { db } from "@/lib/db";
import {
  scmLeads,
  scmOpportunities,
  scmRateQuotations,
  scmContracts,
  scmCustomers,
  cspPortalBookings,
  cspPortalBookingContainers,
  odmBillsOfLading,
  firmFreightInvoices,
  ports,
  vessels,
  customers,
  exchangeRates,
  svpServiceSchedules,
  svpDeploymentPlans,
  svpEtaManagements,
  capVesselSchedules,
  capPortRotations,
  capTradeAllocations,
  capLoadingLists,
  vpeNoonReports,
  vpeSpeedConsumptions,
  vpeVoyagePerformances,
} from "@/db/schema";
import { eq, and, ilike, isNull } from "drizzle-orm";
import type { StepExecutorConfig } from "./executor-configs/e2e-01-lead-to-quote";
import { createEntityBinding } from "./entity-binding-service";
import { resolveEntityInFlow } from "./entity-binding-service";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface CrudExecutionParams {
  tenantId: string;
  flowInstanceId: string;
  stepInstanceId: string;
  stepNumber: number;
  config: StepExecutorConfig;
  /** Input data collected from the form or resolved from prior steps */
  inputData: Record<string, unknown>;
  /** User who triggered the execution */
  userId: string;
}

interface CrudExecutionResult {
  status: "completed" | "failed";
  entityTable: string;
  entityId: string;
  entityAction: string;
  entityData: Record<string, unknown>;
  error?: string;
}

// ═══════════════════════════════════════════════════════════
// TABLE REGISTRY — maps table names to Drizzle table objects
// ═══════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TABLE_REGISTRY: Record<string, {
  table: any;
  idColumn: "id";
}> = {
  scm_leads: { table: scmLeads, idColumn: "id" },
  scm_opportunities: { table: scmOpportunities, idColumn: "id" },
  scm_rate_quotations: { table: scmRateQuotations, idColumn: "id" },
  scm_contracts: { table: scmContracts, idColumn: "id" },
  scm_customers: { table: scmCustomers, idColumn: "id" },
  csp_portal_bookings: { table: cspPortalBookings, idColumn: "id" },
  csp_portal_booking_containers: { table: cspPortalBookingContainers, idColumn: "id" },
  odm_bills_of_lading: { table: odmBillsOfLading, idColumn: "id" },
  firm_freight_invoices: { table: firmFreightInvoices, idColumn: "id" },
  mdm_ports: { table: ports, idColumn: "id" },
  mdm_vessels: { table: vessels, idColumn: "id" },
  mdm_customers: { table: customers, idColumn: "id" },
  mdm_exchange_rates: { table: exchangeRates, idColumn: "id" },

  // Voyage tables (E2E-18)
  svp_service_schedules: { table: svpServiceSchedules, idColumn: "id" },
  svp_deployment_plans: { table: svpDeploymentPlans, idColumn: "id" },
  svp_eta_managements: { table: svpEtaManagements, idColumn: "id" },
  cap_vessel_schedules: { table: capVesselSchedules, idColumn: "id" },
  cap_port_rotations: { table: capPortRotations, idColumn: "id" },
  cap_trade_allocations: { table: capTradeAllocations, idColumn: "id" },
  cap_loading_lists: { table: capLoadingLists, idColumn: "id" },
  vpe_noon_reports: { table: vpeNoonReports, idColumn: "id" },
  vpe_speed_consumptions: { table: vpeSpeedConsumptions, idColumn: "id" },
  vpe_voyage_performances: { table: vpeVoyagePerformances, idColumn: "id" },
};

// ═══════════════════════════════════════════════════════════
// MAIN EXECUTOR
// ═══════════════════════════════════════════════════════════

export async function executeCrudStep(params: CrudExecutionParams): Promise<CrudExecutionResult> {
  const { tenantId, flowInstanceId, stepInstanceId, config, inputData, userId } = params;

  if (!config.entityTable || !config.entityAction) {
    return {
      status: "failed",
      entityTable: config.entityTable ?? "unknown",
      entityId: "",
      entityAction: config.entityAction ?? "unknown",
      entityData: {},
      error: "Missing entityTable or entityAction in config",
    };
  }

  const tableEntry = TABLE_REGISTRY[config.entityTable];
  if (!tableEntry) {
    return {
      status: "failed",
      entityTable: config.entityTable,
      entityId: "",
      entityAction: config.entityAction,
      entityData: {},
      error: `Unknown entity table: ${config.entityTable}`,
    };
  }

  try {
    if (config.entityAction === "create") {
      return await executeCreate(params, tableEntry);
    } else if (config.entityAction === "update") {
      return await executeUpdate(params, tableEntry);
    } else {
      return {
        status: "failed",
        entityTable: config.entityTable,
        entityId: "",
        entityAction: config.entityAction,
        entityData: {},
        error: `Unsupported entity action for CRUD executor: ${config.entityAction}`,
      };
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[EntityStepExecutor] CRUD step failed:`, errorMsg);
    return {
      status: "failed",
      entityTable: config.entityTable,
      entityId: "",
      entityAction: config.entityAction,
      entityData: {},
      error: errorMsg,
    };
  }
}

// ═══════════════════════════════════════════════════════════
// CREATE ENTITY
// ═══════════════════════════════════════════════════════════

async function executeCreate(
  params: CrudExecutionParams,
  tableEntry: { table: typeof scmLeads | typeof scmOpportunities | typeof scmRateQuotations }
): Promise<CrudExecutionResult> {
  const { tenantId, flowInstanceId, stepInstanceId, config, inputData, userId } = params;

  // Map input fields to DB columns
  const dbValues = mapFieldsToColumns(inputData, config.fieldMapping ?? {});

  // Apply defaults
  if (config.defaults) {
    for (const [key, value] of Object.entries(config.defaults)) {
      if (!(key in dbValues)) {
        dbValues[key] = value;
      }
    }
  }

  // Always set tenantId
  dbValues.tenantId = tenantId;

  // Resolve foreign keys from prior step bindings
  if (config.foreignKeys) {
    for (const [, fkConfig] of Object.entries(config.foreignKeys)) {
      const binding = await resolveEntityInFlow(flowInstanceId, tenantId, fkConfig.fromTable);
      if (binding) {
        dbValues[fkConfig.toColumn] = binding.entityId;
      }
    }
  }

  // For opportunities: auto-generate opportunity name from lead if not provided
  if (config.entityTable === "scm_opportunities" && !dbValues.opportunityName) {
    const leadBinding = await resolveEntityInFlow(flowInstanceId, tenantId, "scm_leads");
    if (leadBinding) {
      const leadData = leadBinding.entityData as Record<string, unknown> | null;
      dbValues.opportunityName = `Opportunity - ${leadData?.companyName ?? "New Lead"}`;
    }
  }

  // For opportunities: require ownerId (use current user)
  if (config.entityTable === "scm_opportunities" && !dbValues.ownerId) {
    dbValues.ownerId = userId;
  }

  // For opportunities: need customerId — resolve from lead's converted customer,
  // match existing customer by company name, or auto-create from lead data.
  if (config.entityTable === "scm_opportunities" && !dbValues.customerId) {
    const leadBinding = await resolveEntityInFlow(flowInstanceId, tenantId, "scm_leads");
    if (leadBinding) {
      const leadData = leadBinding.entityData as Record<string, unknown> | null;

      // 1. Check if lead already has a converted customer
      if (leadData?.convertedToCustomerId) {
        dbValues.customerId = leadData.convertedToCustomerId;
      } else {
        const companyName = leadData?.companyName as string | undefined;

        // 2. Search for existing customer by company name (same tenant)
        let existingCustomerId: string | null = null;
        if (companyName) {
          const [existing] = await db
            .select({ id: scmCustomers.id })
            .from(scmCustomers)
            .where(
              and(
                eq(scmCustomers.tenantId, tenantId),
                ilike(scmCustomers.companyName, companyName),
                isNull(scmCustomers.deletedAt)
              )
            )
            .limit(1);
          if (existing) existingCustomerId = existing.id;
        }

        if (existingCustomerId) {
          // Use existing customer
          dbValues.customerId = existingCustomerId;
        } else {
          // 3. Auto-create customer from lead data
          const customerCode = `CUST-${Date.now().toString(36).toUpperCase()}`;
          const [newCustomer] = await db
            .insert(scmCustomers)
            .values({
              tenantId,
              customerCode,
              companyName: companyName ?? "Unknown",
              customerType: "shipper",
              country: (leadData?.country as string) ?? "QA",
              city: (leadData?.city as string) ?? undefined,
              phone: (leadData?.contactPhone as string) ?? undefined,
              email: (leadData?.contactEmail as string) ?? undefined,
              industry: (leadData?.industry as string) ?? undefined,
              status: "active",
              notes: `Auto-created from lead ${leadBinding.entityId} during E2E flow`,
            })
            .returning({ id: scmCustomers.id });

          dbValues.customerId = newCustomer.id;

          // Update lead with converted customer reference
          await db
            .update(scmLeads)
            .set({
              convertedToCustomerId: newCustomer.id,
              convertedAt: new Date(),
              status: "converted",
            })
            .where(
              and(
                eq(scmLeads.id, leadBinding.entityId),
                eq(scmLeads.tenantId, tenantId)
              )
            );
        }
      }
    }
  }

  // For rate quotations: require salesRepId and customerId
  if (config.entityTable === "scm_rate_quotations") {
    if (!dbValues.salesRepId) dbValues.salesRepId = userId;
    // Try to get customerId from opportunity
    if (!dbValues.customerId) {
      const oppBinding = await resolveEntityInFlow(flowInstanceId, tenantId, "scm_opportunities");
      if (oppBinding) {
        const oppData = oppBinding.entityData as Record<string, unknown> | null;
        if (oppData?.customerId) dbValues.customerId = oppData.customerId;
      }
    }
    // Generate quotation number
    if (!dbValues.quotationNumber) {
      dbValues.quotationNumber = `QT-${Date.now().toString(36).toUpperCase()}`;
    }
    // Default validity
    if (!dbValues.validFrom) dbValues.validFrom = new Date();
    if (!dbValues.validTo) {
      const validTo = new Date();
      validTo.setDate(validTo.getDate() + 30);
      dbValues.validTo = validTo;
    }
  }

  // Insert into DB — dynamic column mapping requires type override
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [created] = await db
    .insert(tableEntry.table)
    .values(dbValues as any)
    .returning();

  if (!created) {
    return {
      status: "failed",
      entityTable: config.entityTable!,
      entityId: "",
      entityAction: "create",
      entityData: {},
      error: "Insert returned no rows",
    };
  }

  const entityId = (created as Record<string, unknown>).id as string;
  const entityData = created as Record<string, unknown>;

  // Create entity binding
  await createEntityBinding({
    tenantId,
    stepInstanceId,
    flowInstanceId,
    entityTable: config.entityTable!,
    entityId,
    entityAction: "create",
    entityData,
  });

  return {
    status: "completed",
    entityTable: config.entityTable!,
    entityId,
    entityAction: "create",
    entityData,
  };
}

// ═══════════════════════════════════════════════════════════
// UPDATE ENTITY
// ═══════════════════════════════════════════════════════════

async function executeUpdate(
  params: CrudExecutionParams,
  tableEntry: { table: typeof scmLeads | typeof scmOpportunities | typeof scmRateQuotations }
): Promise<CrudExecutionResult> {
  const { tenantId, flowInstanceId, stepInstanceId, config, inputData } = params;

  // Find the entity to update from prior step bindings
  const existingBinding = await resolveEntityInFlow(flowInstanceId, tenantId, config.entityTable!);
  if (!existingBinding) {
    return {
      status: "failed",
      entityTable: config.entityTable!,
      entityId: "",
      entityAction: "update",
      entityData: {},
      error: `No existing ${config.entityTable} entity found in flow bindings`,
    };
  }

  const entityId = existingBinding.entityId;

  // Map input fields to DB columns
  const dbValues = mapFieldsToColumns(inputData, config.fieldMapping ?? {});

  // Apply defaults
  if (config.defaults) {
    for (const [key, value] of Object.entries(config.defaults)) {
      if (!(key in dbValues)) {
        dbValues[key] = value;
      }
    }
  }

  // Only update if we have values to set
  if (Object.keys(dbValues).length === 0) {
    return {
      status: "completed",
      entityTable: config.entityTable!,
      entityId,
      entityAction: "update",
      entityData: existingBinding.entityData as Record<string, unknown> ?? {},
    };
  }

  // Update the entity — dynamic column mapping requires type override
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [updated] = await db
    .update(tableEntry.table)
    .set(dbValues as any)
    .where(
      and(
        eq(tableEntry.table.id, entityId),
        eq(tableEntry.table.tenantId, tenantId)
      )
    )
    .returning();

  const entityData = (updated ?? {}) as Record<string, unknown>;

  // Create entity binding for the update
  await createEntityBinding({
    tenantId,
    stepInstanceId,
    flowInstanceId,
    entityTable: config.entityTable!,
    entityId,
    entityAction: "update",
    entityData,
  });

  return {
    status: "completed",
    entityTable: config.entityTable!,
    entityId,
    entityAction: "update",
    entityData,
  };
}

// ═══════════════════════════════════════════════════════════
// HUMAN FORM ENTITY INSERT
// ═══════════════════════════════════════════════════════════

/**
 * Insert a real entity into the DB from a human_form step submission.
 * Maps form field names (e.g., "Company Name") to DB column names (e.g., "companyName")
 * using a standard camelCase conversion, then inserts into the target table.
 */
export async function insertEntityForHumanFormStep(params: {
  tenantId: string;
  entityTable: string;
  entityData: Record<string, unknown>;
  userId: string;
}): Promise<{ entityId: string; entityData: Record<string, unknown> } | null> {
  const { tenantId, entityTable, entityData, userId } = params;

  const tableEntry = TABLE_REGISTRY[entityTable];
  if (!tableEntry) return null;

  // Map human-friendly field names to DB column names
  const dbValues: Record<string, unknown> = { tenantId };

  // Table-specific field name → column name mappings
  const TABLE_FIELD_MAPS: Record<string, Record<string, string>> = {
    scm_leads: {
      "Company Name": "companyName",
      "Contact Person & Email": "contactName",
      "Contact Person": "contactName",
      "Contact Name": "contactName",
      "Contact Email": "contactEmail",
      "Contact Phone": "contactPhone",
      "Email": "contactEmail",
      "Phone": "contactPhone",
      "Trade Lanes of Interest": "tradeLane",
      "Trade Lane": "tradeLane",
      "Estimated Annual TEU Volume": "estimatedTeu",
      "Estimated TEU": "estimatedTeu",
      "Cargo Types (dry/reefer/DG/OOG)": "notes",
      "Current Carrier(s)": "notes",
      "Source Channel": "source",
      "Source": "source",
      "Country": "country",
      "City": "city",
      "Industry": "industry",
      "Job Title": "jobTitle",
      "Notes": "notes",
    },
    svp_service_schedules: {
      "Service Name": "serviceName",
      "Service Code": "serviceCode",
      "Schedule Type": "scheduleType",
      "Trade Route": "tradeRoute",
      "Vessel Name": "vesselName",
      "Frequency (Days)": "frequencyDays",
      "Port Count": "portCount",
      "Transit Time (Days)": "transitTimeDays",
      "Effective From": "effectiveFrom",
      "Effective To": "effectiveTo",
      "Notes": "notes",
    },
    cap_vessel_schedules: {
      "Vessel Name": "vesselName",
      "Vessel IMO": "vesselImo",
      "Service Name": "serviceName",
      "Trade Lane": "tradeLane",
      "Schedule Type": "scheduleType",
      "Validity From": "validityFrom",
      "Validity To": "validityTo",
      "Frequency": "frequency",
      "Total Capacity (TEU)": "totalCapacityTeu",
      "Total Weight (MT)": "totalWeightMt",
      "Operator Name": "operatorName",
      "Cycle Number": "metadata",
      "Notes": "notes",
    },
    cap_port_rotations: {
      "Port Code": "portCode",
      "Port Name": "portName",
      "Terminal Name": "terminalName",
      "Cargo Cut-off": "notes",
      "Documentation Cut-off": "notes",
      "VGM Cut-off": "notes",
      "Gate Open": "notes",
      "Gate Close": "notes",
      "Rotation Number": "notes",
      "IGM Number": "notes",
      "EGM Number": "notes",
      "Notes": "notes",
    },
    vpe_noon_reports: {
      "Vessel Name": "vesselName",
      "Voyage ID": "voyageId",
      "Report Type": "reportType",
      "Latitude": "latitude",
      "Longitude": "longitude",
      "Course Heading": "courseHeading",
      "Distance Since Last Report": "distanceSinceLastReport",
      "Distance To Go": "distanceToGo",
      "Average Speed": "avgSpeed",
      "Wind Direction": "windDirection",
      "Wind Force": "windForce",
      "Sea State": "seaState",
      "Swell Height": "swellHeight",
      "ROB FO": "robFo",
      "ROB DO": "robDo",
      "ROB LO": "robLo",
      "ME Consumption": "meConsumption",
      "AE Consumption": "aeConsumption",
      "Boiler Consumption": "boilerConsumption",
      "ETA": "eta",
      "Master Remarks": "masterRemarks",
      "Notes": "notes",
    },
  };

  const fieldMap = TABLE_FIELD_MAPS[entityTable] ?? {};

  for (const [key, value] of Object.entries(entityData)) {
    if (value === undefined || value === null || value === "") continue;

    // Try mapped name first
    const mapped = fieldMap[key];
    if (mapped) {
      // For notes-type fields, concatenate if already set
      if (mapped === "notes" && dbValues.notes) {
        dbValues.notes = `${dbValues.notes}\n${key}: ${value}`;
      } else {
        dbValues[mapped] = value;
      }
    } else {
      // Try direct camelCase column name
      const camel = key.replace(/\s+(.)/g, (_, c: string) => c.toUpperCase()).replace(/\s+/g, "").replace(/^(.)/, (c) => c.toLowerCase());
      dbValues[camel] = value;
    }
  }

  // Lead-specific: parse "Contact Person & Email" into separate fields
  if (entityTable === "scm_leads") {
    if (dbValues.contactName && typeof dbValues.contactName === "string") {
      const val = dbValues.contactName;
      const emailMatch = val.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch && !dbValues.contactEmail) {
        dbValues.contactEmail = emailMatch[0];
        dbValues.contactName = val.replace(emailMatch[0], "").replace(/[,;/|]+/g, "").trim() || val;
      }
    }
  }

  // Table-specific defaults
  if (entityTable === "scm_leads") {
    if (!dbValues.source) dbValues.source = "manual_entry";
    if (!dbValues.companyName) dbValues.companyName = "Unknown";
    if (!dbValues.contactName) dbValues.contactName = "Unknown";
    if (!dbValues.status) dbValues.status = "new";
    dbValues.assignedTo = userId;
  } else if (entityTable === "svp_service_schedules") {
    if (!dbValues.scheduleType) dbValues.scheduleType = "liner_service";
    if (!dbValues.scheduleRef) dbValues.scheduleRef = `SVC-${Date.now().toString(36).toUpperCase()}`;
    if (!dbValues.status) dbValues.status = "draft";
    dbValues.createdBy = userId;
  } else if (entityTable === "cap_vessel_schedules") {
    if (!dbValues.validityFrom) dbValues.validityFrom = new Date();
    if (!dbValues.status) dbValues.status = "draft";
    dbValues.createdBy = userId;
  } else if (entityTable === "cap_port_rotations") {
    if (!dbValues.callPurpose) dbValues.callPurpose = "both";
    if (!dbValues.status) dbValues.status = "scheduled";
    dbValues.createdBy = userId;
  } else if (entityTable === "vpe_noon_reports") {
    if (!dbValues.reportRef) dbValues.reportRef = `NR-${Date.now().toString(36).toUpperCase()}`;
    if (!dbValues.reportType) dbValues.reportType = "noon";
    if (!dbValues.reportDatetime) dbValues.reportDatetime = new Date();
    if (!dbValues.status) dbValues.status = "active";
    dbValues.createdBy = userId;
  } else {
    // Generic defaults for other tables
    if (!dbValues.status) dbValues.status = "draft";
    dbValues.createdBy = userId;
  }

  // Convert TEU to integer
  if (dbValues.estimatedTeu && typeof dbValues.estimatedTeu === "string") {
    dbValues.estimatedTeu = parseInt(dbValues.estimatedTeu, 10) || null;
  }

  // Convert date strings to Date objects for timestamp columns
  const dateColumns = [
    "validityFrom", "validityTo", "effectiveFrom", "effectiveTo",
    "deploymentStart", "deploymentEnd", "reportDatetime", "eta",
    "arrivalEta", "departureEtd", "publishedAt", "scheduledDate",
    "cutOffCargo", "cutOffDocumentation", "cutOffVgm",
  ];
  for (const col of dateColumns) {
    if (dbValues[col] && typeof dbValues[col] === "string") {
      const parsed = new Date(dbValues[col] as string);
      dbValues[col] = isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  // Convert numeric strings to numbers for integer/decimal columns
  const intColumns = [
    "totalCapacityTeu", "totalWeightMt", "frequencyDays", "portCount",
    "transitTimeDays", "sequenceNumber", "windForce",
  ];
  for (const col of intColumns) {
    if (dbValues[col] && typeof dbValues[col] === "string") {
      dbValues[col] = parseInt(dbValues[col] as string, 10) || null;
    }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [created] = await db.insert(tableEntry.table).values(dbValues as any).returning();
    if (!created) return null;

    const record = created as Record<string, unknown>;
    return { entityId: record.id as string, entityData: record };
  } catch (err) {
    console.error(`[insertEntityForHumanFormStep] Failed to insert into ${entityTable}:`, err);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
// FIELD MAPPING
// ═══════════════════════════════════════════════════════════

/**
 * Map input field names to DB column names using the field mapping config.
 * Input fields that aren't in the mapping are skipped.
 * Also handles direct column-name inputs (for programmatic callers).
 */
function mapFieldsToColumns(
  inputData: Record<string, unknown>,
  fieldMapping: Record<string, string>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Build reverse mapping: columnName → true (for detecting direct column inputs)
  const validColumns = new Set(Object.values(fieldMapping));

  for (const [key, value] of Object.entries(inputData)) {
    if (value === undefined || value === null || value === "") continue;

    // Check if key is a mapped field name (e.g., "Company Name" → "companyName")
    if (fieldMapping[key]) {
      result[fieldMapping[key]] = value;
    }
    // Check if key is already a column name (e.g., "companyName" directly)
    else if (validColumns.has(key)) {
      result[key] = value;
    }
    // H4 fix: removed catch-all camelCase pass-through to prevent mass-assignment.
    // Only mapped fields and known valid columns are accepted.
    // If a field is not in the mapping, it is silently dropped.
  }

  return result;
}
