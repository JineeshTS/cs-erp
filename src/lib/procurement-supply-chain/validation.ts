import { z } from "zod/v4";

// ==========================================
// Purchase Requisition Management
// ==========================================
export const createPurchaseRequisitionSchema = z.object({
  requisitionType: z.enum(["standard", "urgent", "blanket", "planned", "emergency"]),
  title: z.string().min(1).max(255),
  requestedBy: z.string().max(255).optional(),
  department: z.string().max(255).optional(),
  costCenter: z.string().max(100).optional(),
  requestDate: z.coerce.date().optional(),
  requiredDate: z.coerce.date().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  lineItems: z.array(z.record(z.string(), z.unknown())).optional(),
  totalEstimatedCost: z.string().optional(),
  currency: z.string().max(3).optional(),
  justification: z.string().optional(),
  approver: z.string().max(255).optional(),
  approvalDate: z.coerce.date().optional(),
  rejectionReason: z.string().optional(),
  linkedPoRef: z.string().max(50).optional(),
  budgetCode: z.string().max(50).optional(),
  deliveryLocation: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updatePurchaseRequisitionSchema = createPurchaseRequisitionSchema.partial();

// ==========================================
// Vendor Sourcing & RFQ Process
// ==========================================
export const createVendorSourcingSchema = z.object({
  sourcingType: z.enum(["rfq", "rfp", "rfi", "reverse_auction", "sole_source"]),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().max(255).optional(),
  issueDate: z.coerce.date().optional(),
  closingDate: z.coerce.date().optional(),
  evaluationDate: z.coerce.date().optional(),
  invitedVendors: z.array(z.record(z.string(), z.unknown())).optional(),
  evaluationCriteria: z.array(z.record(z.string(), z.unknown())).optional(),
  submissions: z.array(z.record(z.string(), z.unknown())).optional(),
  selectedVendor: z.string().max(255).optional(),
  selectionReason: z.string().optional(),
  totalBudget: z.string().optional(),
  currency: z.string().max(3).optional(),
  linkedRequisitionRef: z.string().max(50).optional(),
  linkedPoRef: z.string().max(50).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateVendorSourcingSchema = createVendorSourcingSchema.partial();

// ==========================================
// Purchase Order Lifecycle Management
// ==========================================
export const createPurchaseOrderSchema = z.object({
  poType: z.enum(["standard", "blanket", "contract", "scheduled", "emergency"]),
  vendorName: z.string().max(255).optional(),
  vendorId: z.string().max(100).optional(),
  orderDate: z.coerce.date().optional(),
  deliveryDate: z.coerce.date().optional(),
  lineItems: z.array(z.record(z.string(), z.unknown())).optional(),
  subtotal: z.string().optional(),
  taxAmount: z.string().optional(),
  shippingCost: z.string().optional(),
  discount: z.string().optional(),
  totalAmount: z.string().optional(),
  currency: z.string().max(3).optional(),
  paymentTerms: z.string().max(100).optional(),
  shippingMethod: z.string().max(100).optional(),
  deliveryAddress: z.string().optional(),
  linkedRequisitionRef: z.string().max(50).optional(),
  linkedSourcingRef: z.string().max(50).optional(),
  approvedBy: z.string().max(255).optional(),
  approvalDate: z.coerce.date().optional(),
  receivedDate: z.coerce.date().optional(),
  invoiceRef: z.string().max(100).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updatePurchaseOrderSchema = createPurchaseOrderSchema.partial();

// ==========================================
// Procurement Contract Management
// ==========================================
export const createProcurementContractSchema = z.object({
  contractType: z.enum(["fixed_price", "cost_plus", "framework", "blanket", "service_level"]),
  title: z.string().min(1).max(255),
  vendorName: z.string().max(255).optional(),
  vendorId: z.string().max(100).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  contractValue: z.string().optional(),
  currency: z.string().max(3).optional(),
  paymentTerms: z.string().max(100).optional(),
  autoRenewal: z.boolean().optional(),
  renewalNoticeDays: z.number().int().optional(),
  penaltyClause: z.string().optional(),
  kpiMetrics: z.array(z.record(z.string(), z.unknown())).optional(),
  milestones: z.array(z.record(z.string(), z.unknown())).optional(),
  linkedPoRefs: z.array(z.string()).optional(),
  signedBy: z.string().max(255).optional(),
  signatureDate: z.coerce.date().optional(),
  terminationDate: z.coerce.date().optional(),
  terminationReason: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateProcurementContractSchema = createProcurementContractSchema.partial();

// ==========================================
// Inventory Management & Stock Control
// ==========================================
export const createInventoryStockControlSchema = z.object({
  inventoryType: z.enum(["raw_material", "spare_part", "consumable", "finished_goods", "safety_stock"]),
  itemCode: z.string().min(1).max(100),
  itemName: z.string().min(1).max(255),
  category: z.string().max(255).optional(),
  uom: z.string().max(30).optional(),
  currentStock: z.string().optional(),
  reorderLevel: z.string().optional(),
  reorderQuantity: z.string().optional(),
  safetyStock: z.string().optional(),
  maxStock: z.string().optional(),
  unitCost: z.string().optional(),
  totalValue: z.string().optional(),
  currency: z.string().max(3).optional(),
  warehouseLocation: z.string().max(255).optional(),
  binNumber: z.string().max(50).optional(),
  lastReceivedDate: z.coerce.date().optional(),
  lastIssuedDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  batchNumber: z.string().max(100).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateInventoryStockControlSchema = createInventoryStockControlSchema.partial();

// ==========================================
// Goods Receipt & Quality Inspection
// ==========================================
export const createGoodsReceiptInspectionSchema = z.object({
  receiptType: z.enum(["standard", "return", "transfer", "adjustment", "inspection"]),
  linkedPoRef: z.string().max(50).optional(),
  vendorName: z.string().max(255).optional(),
  vendorId: z.string().max(100).optional(),
  receiptDate: z.coerce.date().optional(),
  receivedBy: z.string().max(255).optional(),
  lineItems: z.array(z.record(z.string(), z.unknown())).optional(),
  totalOrderedQty: z.string().optional(),
  totalReceivedQty: z.string().optional(),
  totalAcceptedQty: z.string().optional(),
  totalRejectedQty: z.string().optional(),
  inspectionDate: z.coerce.date().optional(),
  inspectedBy: z.string().max(255).optional(),
  inspectionResult: z.enum(["pass", "fail", "partial", "conditional"]).optional(),
  inspectionFindings: z.array(z.record(z.string(), z.unknown())).optional(),
  qualityCertificateRef: z.string().max(100).optional(),
  warehouseLocation: z.string().max(255).optional(),
  deliveryNoteRef: z.string().max(100).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateGoodsReceiptInspectionSchema = createGoodsReceiptInspectionSchema.partial();

// ==========================================
// AI Spend Analytics & Optimization
// ==========================================
export const createSpendAnalyticSchema = z.object({
  analyticsType: z.enum(["category_analysis", "vendor_analysis", "trend_analysis", "savings_opportunity", "anomaly_detection", "forecast"]),
  title: z.string().min(1).max(255),
  analysisPeriodStart: z.coerce.date().optional(),
  analysisPeriodEnd: z.coerce.date().optional(),
  totalSpend: z.string().optional(),
  currency: z.string().max(3).optional(),
  categoryBreakdown: z.array(z.record(z.string(), z.unknown())).optional(),
  vendorBreakdown: z.array(z.record(z.string(), z.unknown())).optional(),
  savingsIdentified: z.string().optional(),
  savingsRealized: z.string().optional(),
  recommendations: z.array(z.record(z.string(), z.unknown())).optional(),
  anomalies: z.array(z.record(z.string(), z.unknown())).optional(),
  forecastNextPeriod: z.string().optional(),
  confidenceScore: z.string().optional(),
  aiModelUsed: z.string().max(100).optional(),
  dataPoints: z.number().int().optional(),
  generatedBy: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateSpendAnalyticSchema = createSpendAnalyticSchema.partial();

// ==========================================
// Supplier Performance Scorecard
// ==========================================
export const createSupplierScorecardSchema = z.object({
  scorecardType: z.enum(["quarterly", "annual", "project", "incident", "onboarding"]),
  vendorName: z.string().min(1).max(255),
  vendorId: z.string().max(100).optional(),
  evaluationPeriodStart: z.coerce.date().optional(),
  evaluationPeriodEnd: z.coerce.date().optional(),
  qualityScore: z.string().optional(),
  deliveryScore: z.string().optional(),
  priceScore: z.string().optional(),
  serviceScore: z.string().optional(),
  complianceScore: z.string().optional(),
  overallScore: z.string().optional(),
  overallRating: z.enum(["excellent", "good", "satisfactory", "needs_improvement", "poor"]).optional(),
  totalOrdersEvaluated: z.number().int().optional(),
  onTimeDeliveryRate: z.string().optional(),
  defectRate: z.string().optional(),
  responseTimeAvg: z.string().optional(),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  actionItems: z.array(z.record(z.string(), z.unknown())).optional(),
  evaluatedBy: z.string().max(255).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export const updateSupplierScorecardSchema = createSupplierScorecardSchema.partial();
