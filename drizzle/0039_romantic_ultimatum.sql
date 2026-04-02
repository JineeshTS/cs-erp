CREATE TABLE "psc_goods_receipt_inspections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"receipt_ref" varchar(50) NOT NULL,
	"receipt_type" varchar(30) NOT NULL,
	"linked_po_ref" varchar(50),
	"vendor_name" varchar(255),
	"vendor_id" varchar(100),
	"receipt_date" timestamp with time zone,
	"received_by" varchar(255),
	"line_items" jsonb,
	"total_ordered_qty" numeric(14, 2),
	"total_received_qty" numeric(14, 2),
	"total_accepted_qty" numeric(14, 2),
	"total_rejected_qty" numeric(14, 2),
	"inspection_date" timestamp with time zone,
	"inspected_by" varchar(255),
	"inspection_result" varchar(30),
	"inspection_findings" jsonb,
	"quality_certificate_ref" varchar(100),
	"warehouse_location" varchar(255),
	"delivery_note_ref" varchar(100),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "psc_inventory_stock_controls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"inventory_ref" varchar(50) NOT NULL,
	"inventory_type" varchar(30) NOT NULL,
	"item_code" varchar(100) NOT NULL,
	"item_name" varchar(255) NOT NULL,
	"category" varchar(255),
	"uom" varchar(30),
	"current_stock" numeric(14, 2),
	"reorder_level" numeric(14, 2),
	"reorder_quantity" numeric(14, 2),
	"safety_stock" numeric(14, 2),
	"max_stock" numeric(14, 2),
	"unit_cost" numeric(14, 2),
	"total_value" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'QAR',
	"warehouse_location" varchar(255),
	"bin_number" varchar(50),
	"last_received_date" timestamp with time zone,
	"last_issued_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"batch_number" varchar(100),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "psc_procurement_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contract_ref" varchar(50) NOT NULL,
	"contract_type" varchar(30) NOT NULL,
	"title" varchar(255) NOT NULL,
	"vendor_name" varchar(255),
	"vendor_id" varchar(100),
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"contract_value" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'QAR',
	"payment_terms" varchar(100),
	"auto_renewal" boolean DEFAULT false,
	"renewal_notice_days" integer,
	"penalty_clause" text,
	"kpi_metrics" jsonb,
	"milestones" jsonb,
	"linked_po_refs" jsonb,
	"signed_by" varchar(255),
	"signature_date" timestamp with time zone,
	"termination_date" timestamp with time zone,
	"termination_reason" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "psc_purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"po_ref" varchar(50) NOT NULL,
	"po_type" varchar(30) NOT NULL,
	"vendor_name" varchar(255),
	"vendor_id" varchar(100),
	"order_date" timestamp with time zone,
	"delivery_date" timestamp with time zone,
	"line_items" jsonb,
	"subtotal" numeric(14, 2),
	"tax_amount" numeric(14, 2),
	"shipping_cost" numeric(14, 2),
	"discount" numeric(14, 2),
	"total_amount" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'QAR',
	"payment_terms" varchar(100),
	"shipping_method" varchar(100),
	"delivery_address" text,
	"linked_requisition_ref" varchar(50),
	"linked_sourcing_ref" varchar(50),
	"approved_by" varchar(255),
	"approval_date" timestamp with time zone,
	"received_date" timestamp with time zone,
	"invoice_ref" varchar(100),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "psc_purchase_requisitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"requisition_ref" varchar(50) NOT NULL,
	"requisition_type" varchar(30) NOT NULL,
	"title" varchar(255) NOT NULL,
	"requested_by" varchar(255),
	"department" varchar(255),
	"cost_center" varchar(100),
	"request_date" timestamp with time zone,
	"required_date" timestamp with time zone,
	"priority" varchar(20),
	"line_items" jsonb,
	"total_estimated_cost" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'QAR',
	"justification" text,
	"approver" varchar(255),
	"approval_date" timestamp with time zone,
	"rejection_reason" text,
	"linked_po_ref" varchar(50),
	"budget_code" varchar(50),
	"delivery_location" varchar(255),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "psc_spend_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"analytics_ref" varchar(50) NOT NULL,
	"analytics_type" varchar(30) NOT NULL,
	"title" varchar(255) NOT NULL,
	"analysis_period_start" timestamp with time zone,
	"analysis_period_end" timestamp with time zone,
	"total_spend" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'QAR',
	"category_breakdown" jsonb,
	"vendor_breakdown" jsonb,
	"savings_identified" numeric(14, 2),
	"savings_realized" numeric(14, 2),
	"recommendations" jsonb,
	"anomalies" jsonb,
	"forecast_next_period" numeric(14, 2),
	"confidence_score" numeric(5, 2),
	"ai_model_used" varchar(100),
	"data_points" integer,
	"generated_by" varchar(255),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "psc_supplier_scorecards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"scorecard_ref" varchar(50) NOT NULL,
	"scorecard_type" varchar(30) NOT NULL,
	"vendor_name" varchar(255) NOT NULL,
	"vendor_id" varchar(100),
	"evaluation_period_start" timestamp with time zone,
	"evaluation_period_end" timestamp with time zone,
	"quality_score" numeric(5, 2),
	"delivery_score" numeric(5, 2),
	"price_score" numeric(5, 2),
	"service_score" numeric(5, 2),
	"compliance_score" numeric(5, 2),
	"overall_score" numeric(5, 2),
	"overall_rating" varchar(30),
	"total_orders_evaluated" integer,
	"on_time_delivery_rate" numeric(5, 2),
	"defect_rate" numeric(5, 2),
	"response_time_avg" numeric(8, 2),
	"strengths" text,
	"weaknesses" text,
	"action_items" jsonb,
	"evaluated_by" varchar(255),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "psc_vendor_sourcings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"sourcing_ref" varchar(50) NOT NULL,
	"sourcing_type" varchar(30) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(255),
	"issue_date" timestamp with time zone,
	"closing_date" timestamp with time zone,
	"evaluation_date" timestamp with time zone,
	"invited_vendors" jsonb,
	"evaluation_criteria" jsonb,
	"submissions" jsonb,
	"selected_vendor" varchar(255),
	"selection_reason" text,
	"total_budget" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'QAR',
	"linked_requisition_ref" varchar(50),
	"linked_po_ref" varchar(50),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "psc_goods_receipt_inspections" ADD CONSTRAINT "psc_goods_receipt_inspections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psc_inventory_stock_controls" ADD CONSTRAINT "psc_inventory_stock_controls_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psc_procurement_contracts" ADD CONSTRAINT "psc_procurement_contracts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psc_purchase_orders" ADD CONSTRAINT "psc_purchase_orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psc_purchase_requisitions" ADD CONSTRAINT "psc_purchase_requisitions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psc_spend_analytics" ADD CONSTRAINT "psc_spend_analytics_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psc_supplier_scorecards" ADD CONSTRAINT "psc_supplier_scorecards_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psc_vendor_sourcings" ADD CONSTRAINT "psc_vendor_sourcings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "psc_receipt_tenant_idx" ON "psc_goods_receipt_inspections" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "psc_receipt_ref_idx" ON "psc_goods_receipt_inspections" USING btree ("receipt_ref");--> statement-breakpoint
CREATE INDEX "psc_receipt_status_idx" ON "psc_goods_receipt_inspections" USING btree ("status");--> statement-breakpoint
CREATE INDEX "psc_receipt_po_idx" ON "psc_goods_receipt_inspections" USING btree ("linked_po_ref");--> statement-breakpoint
CREATE INDEX "psc_inventory_tenant_idx" ON "psc_inventory_stock_controls" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "psc_inventory_ref_idx" ON "psc_inventory_stock_controls" USING btree ("inventory_ref");--> statement-breakpoint
CREATE INDEX "psc_inventory_status_idx" ON "psc_inventory_stock_controls" USING btree ("status");--> statement-breakpoint
CREATE INDEX "psc_inventory_item_idx" ON "psc_inventory_stock_controls" USING btree ("item_code");--> statement-breakpoint
CREATE INDEX "psc_inventory_category_idx" ON "psc_inventory_stock_controls" USING btree ("category");--> statement-breakpoint
CREATE INDEX "psc_contract_tenant_idx" ON "psc_procurement_contracts" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "psc_contract_ref_idx" ON "psc_procurement_contracts" USING btree ("contract_ref");--> statement-breakpoint
CREATE INDEX "psc_contract_status_idx" ON "psc_procurement_contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "psc_contract_vendor_idx" ON "psc_procurement_contracts" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "psc_po_tenant_idx" ON "psc_purchase_orders" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "psc_po_ref_idx" ON "psc_purchase_orders" USING btree ("po_ref");--> statement-breakpoint
CREATE INDEX "psc_po_status_idx" ON "psc_purchase_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "psc_po_vendor_idx" ON "psc_purchase_orders" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "psc_requisitions_tenant_idx" ON "psc_purchase_requisitions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "psc_requisitions_ref_idx" ON "psc_purchase_requisitions" USING btree ("requisition_ref");--> statement-breakpoint
CREATE INDEX "psc_requisitions_status_idx" ON "psc_purchase_requisitions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "psc_requisitions_dept_idx" ON "psc_purchase_requisitions" USING btree ("department");--> statement-breakpoint
CREATE INDEX "psc_analytics_tenant_idx" ON "psc_spend_analytics" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "psc_analytics_ref_idx" ON "psc_spend_analytics" USING btree ("analytics_ref");--> statement-breakpoint
CREATE INDEX "psc_analytics_status_idx" ON "psc_spend_analytics" USING btree ("status");--> statement-breakpoint
CREATE INDEX "psc_analytics_type_idx" ON "psc_spend_analytics" USING btree ("analytics_type");--> statement-breakpoint
CREATE INDEX "psc_scorecard_tenant_idx" ON "psc_supplier_scorecards" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "psc_scorecard_ref_idx" ON "psc_supplier_scorecards" USING btree ("scorecard_ref");--> statement-breakpoint
CREATE INDEX "psc_scorecard_status_idx" ON "psc_supplier_scorecards" USING btree ("status");--> statement-breakpoint
CREATE INDEX "psc_scorecard_vendor_idx" ON "psc_supplier_scorecards" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "psc_sourcing_tenant_idx" ON "psc_vendor_sourcings" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "psc_sourcing_ref_idx" ON "psc_vendor_sourcings" USING btree ("sourcing_ref");--> statement-breakpoint
CREATE INDEX "psc_sourcing_status_idx" ON "psc_vendor_sourcings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "psc_sourcing_category_idx" ON "psc_vendor_sourcings" USING btree ("category");