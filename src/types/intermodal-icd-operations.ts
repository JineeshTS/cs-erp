import type {
  icdDryPorts,
  icdRailPlans,
  icdTruckBookings,
  icdBondedWarehouses,
  icdLastMileDeliveries,
  icdMultimodalBols,
  icdHaulageRates,
  icdRouteOptimizations,
} from "@/db/schema";

export type IcdDryPort = typeof icdDryPorts.$inferSelect;
export type NewIcdDryPort = typeof icdDryPorts.$inferInsert;

export type IcdRailPlan = typeof icdRailPlans.$inferSelect;
export type NewIcdRailPlan = typeof icdRailPlans.$inferInsert;

export type IcdTruckBooking = typeof icdTruckBookings.$inferSelect;
export type NewIcdTruckBooking = typeof icdTruckBookings.$inferInsert;

export type IcdBondedWarehouse = typeof icdBondedWarehouses.$inferSelect;
export type NewIcdBondedWarehouse = typeof icdBondedWarehouses.$inferInsert;

export type IcdLastMileDelivery = typeof icdLastMileDeliveries.$inferSelect;
export type NewIcdLastMileDelivery = typeof icdLastMileDeliveries.$inferInsert;

export type IcdMultimodalBol = typeof icdMultimodalBols.$inferSelect;
export type NewIcdMultimodalBol = typeof icdMultimodalBols.$inferInsert;

export type IcdHaulageRate = typeof icdHaulageRates.$inferSelect;
export type NewIcdHaulageRate = typeof icdHaulageRates.$inferInsert;

export type IcdRouteOptimization = typeof icdRouteOptimizations.$inferSelect;
export type NewIcdRouteOptimization = typeof icdRouteOptimizations.$inferInsert;
