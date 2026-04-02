import type {
  pscPurchaseRequisitions,
  pscVendorSourcings,
  pscPurchaseOrders,
  pscProcurementContracts,
  pscInventoryStockControls,
  pscGoodsReceiptInspections,
  pscSpendAnalytics,
  pscSupplierScorecards,
} from "@/db/schema";

export type PscPurchaseRequisition = typeof pscPurchaseRequisitions.$inferSelect;
export type NewPscPurchaseRequisition = typeof pscPurchaseRequisitions.$inferInsert;

export type PscVendorSourcing = typeof pscVendorSourcings.$inferSelect;
export type NewPscVendorSourcing = typeof pscVendorSourcings.$inferInsert;

export type PscPurchaseOrder = typeof pscPurchaseOrders.$inferSelect;
export type NewPscPurchaseOrder = typeof pscPurchaseOrders.$inferInsert;

export type PscProcurementContract = typeof pscProcurementContracts.$inferSelect;
export type NewPscProcurementContract = typeof pscProcurementContracts.$inferInsert;

export type PscInventoryStockControl = typeof pscInventoryStockControls.$inferSelect;
export type NewPscInventoryStockControl = typeof pscInventoryStockControls.$inferInsert;

export type PscGoodsReceiptInspection = typeof pscGoodsReceiptInspections.$inferSelect;
export type NewPscGoodsReceiptInspection = typeof pscGoodsReceiptInspections.$inferInsert;

export type PscSpendAnalytic = typeof pscSpendAnalytics.$inferSelect;
export type NewPscSpendAnalytic = typeof pscSpendAnalytics.$inferInsert;

export type PscSupplierScorecard = typeof pscSupplierScorecards.$inferSelect;
export type NewPscSupplierScorecard = typeof pscSupplierScorecards.$inferInsert;
