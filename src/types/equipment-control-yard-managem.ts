import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  eqyContainerFleet,
  eqyRepositioningPlans,
  eqyReeferContainers,
  eqyMaintenanceRepairs,
  eqyYardSlots,
  eqyGateMovements,
  eqyEquipmentInterchanges,
  eqyOnHireOffHire,
  eqyContainerSurveys,
  eqyLeasedContainers,
  eqyAvailabilityPlans,
  eqyRepositioningOptimizations,
} from "@/db/schema/equipment-control-yard-managem";

// Container Fleet
export type ContainerFleetRecord = InferSelectModel<typeof eqyContainerFleet>;
export type NewContainerFleetRecord = InferInsertModel<typeof eqyContainerFleet>;

// Repositioning Plan
export type RepositioningPlan = InferSelectModel<typeof eqyRepositioningPlans>;
export type NewRepositioningPlan = InferInsertModel<typeof eqyRepositioningPlans>;

// Reefer Container
export type ReeferContainer = InferSelectModel<typeof eqyReeferContainers>;
export type NewReeferContainer = InferInsertModel<typeof eqyReeferContainers>;

// Maintenance Repair
export type MaintenanceRepair = InferSelectModel<typeof eqyMaintenanceRepairs>;
export type NewMaintenanceRepair = InferInsertModel<typeof eqyMaintenanceRepairs>;

// Yard Slot
export type YardSlot = InferSelectModel<typeof eqyYardSlots>;
export type NewYardSlot = InferInsertModel<typeof eqyYardSlots>;

// Gate Movement
export type GateMovement = InferSelectModel<typeof eqyGateMovements>;
export type NewGateMovement = InferInsertModel<typeof eqyGateMovements>;

// Equipment Interchange
export type EquipmentInterchange = InferSelectModel<typeof eqyEquipmentInterchanges>;
export type NewEquipmentInterchange = InferInsertModel<typeof eqyEquipmentInterchanges>;

// On-Hire Off-Hire
export type OnHireOffHire = InferSelectModel<typeof eqyOnHireOffHire>;
export type NewOnHireOffHire = InferInsertModel<typeof eqyOnHireOffHire>;

// Container Survey
export type ContainerSurvey = InferSelectModel<typeof eqyContainerSurveys>;
export type NewContainerSurvey = InferInsertModel<typeof eqyContainerSurveys>;

// Leased Container
export type LeasedContainer = InferSelectModel<typeof eqyLeasedContainers>;
export type NewLeasedContainer = InferInsertModel<typeof eqyLeasedContainers>;

// Availability Plan
export type AvailabilityPlan = InferSelectModel<typeof eqyAvailabilityPlans>;
export type NewAvailabilityPlan = InferInsertModel<typeof eqyAvailabilityPlans>;

// Repositioning Optimization
export type RepositioningOptimization = InferSelectModel<typeof eqyRepositioningOptimizations>;
export type NewRepositioningOptimization = InferInsertModel<typeof eqyRepositioningOptimizations>;
