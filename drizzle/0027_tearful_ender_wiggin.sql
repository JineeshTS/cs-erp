CREATE TABLE "ddm_demurrage_calculations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"calculation_ref" varchar(50) NOT NULL,
	"container_number" varchar(20) NOT NULL,
	"container_size" varchar(10) NOT NULL,
	"container_type" varchar(30) NOT NULL,
	"booking_ref" varchar(50),
	"bl_number" varchar(50),
	"customer_name" varchar(255) NOT NULL,
	"port_name" varchar(255) NOT NULL,
	"port_country" varchar(100),
	"terminal_name" varchar(255),
	"discharge_date" timestamp with time zone NOT NULL,
	"gate_out_date" timestamp with time zone,
	"free_time_days" integer NOT NULL,
	"free_time_expiry" timestamp with time zone NOT NULL,
	"demurrage_days" integer,
	"daily_rate" numeric(10, 2) NOT NULL,
	"total_amount" numeric(12, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"tariff_id" uuid,
	"tariff_name" varchar(255),
	"calculation_breakdown" jsonb,
	"auto_calculated" boolean DEFAULT true,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ddm_detention_trackings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tracking_ref" varchar(50) NOT NULL,
	"container_number" varchar(20) NOT NULL,
	"container_size" varchar(10) NOT NULL,
	"container_type" varchar(30) NOT NULL,
	"booking_ref" varchar(50),
	"bl_number" varchar(50),
	"customer_name" varchar(255) NOT NULL,
	"gate_out_date" timestamp with time zone NOT NULL,
	"gate_in_date" timestamp with time zone,
	"free_time_days" integer NOT NULL,
	"free_time_expiry" timestamp with time zone NOT NULL,
	"detention_days" integer,
	"daily_rate" numeric(10, 2) NOT NULL,
	"total_amount" numeric(12, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"depot_name" varchar(255),
	"depot_location" varchar(255),
	"container_condition" varchar(30),
	"damage_notes" text,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ddm_disputes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"dispute_ref" varchar(50) NOT NULL,
	"invoice_ref" varchar(50),
	"customer_name" varchar(255) NOT NULL,
	"container_number" varchar(20),
	"dispute_type" varchar(30) NOT NULL,
	"dispute_reason" text NOT NULL,
	"disputed_amount" numeric(12, 2) NOT NULL,
	"original_amount" numeric(12, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"filed_date" timestamp with time zone NOT NULL,
	"filed_by_name" varchar(255),
	"assigned_to_name" varchar(255),
	"supporting_documents" jsonb,
	"resolution_notes" text,
	"resolved_amount" numeric(12, 2),
	"resolved_date" timestamp with time zone,
	"resolved_by_name" varchar(255),
	"escalation_level" integer DEFAULT 0,
	"sla_deadline" timestamp with time zone,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ddm_free_time_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"rule_ref" varchar(50) NOT NULL,
	"rule_name" varchar(255) NOT NULL,
	"rule_type" varchar(30) NOT NULL,
	"applicable_to" varchar(30) NOT NULL,
	"port_name" varchar(255),
	"port_country" varchar(100),
	"container_size" varchar(10),
	"container_type" varchar(30),
	"customer_name" varchar(255),
	"free_time_days" integer NOT NULL,
	"grace_period_days" integer DEFAULT 0,
	"weekends_excluded" boolean DEFAULT false,
	"holidays_excluded" boolean DEFAULT false,
	"holiday_calendar" jsonb,
	"tier_structure" jsonb,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone,
	"priority" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ddm_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_ref" varchar(50) NOT NULL,
	"invoice_type" varchar(30) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_code" varchar(50),
	"container_number" varchar(20),
	"booking_ref" varchar(50),
	"bl_number" varchar(50),
	"demurrage_amount" numeric(12, 2),
	"detention_amount" numeric(12, 2),
	"subtotal" numeric(12, 2),
	"tax_rate" numeric(5, 2),
	"tax_amount" numeric(12, 2),
	"total_amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"invoice_date" timestamp with time zone NOT NULL,
	"due_date" timestamp with time zone NOT NULL,
	"paid_date" timestamp with time zone,
	"paid_amount" numeric(12, 2),
	"line_items" jsonb,
	"dispatch_method" varchar(30),
	"dispatched_at" timestamp with time zone,
	"customer_email" varchar(255),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ddm_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"notification_ref" varchar(50) NOT NULL,
	"notification_type" varchar(30) NOT NULL,
	"channel" varchar(20) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_email" varchar(255),
	"customer_phone" varchar(50),
	"container_number" varchar(20),
	"booking_ref" varchar(50),
	"subject" varchar(500) NOT NULL,
	"body" text NOT NULL,
	"template_name" varchar(255),
	"template_variables" jsonb,
	"scheduled_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"failure_reason" text,
	"retry_count" integer DEFAULT 0,
	"related_entity_type" varchar(50),
	"related_entity_id" uuid,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ddm_predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"prediction_ref" varchar(50) NOT NULL,
	"container_number" varchar(20) NOT NULL,
	"booking_ref" varchar(50),
	"customer_name" varchar(255) NOT NULL,
	"port_name" varchar(255),
	"prediction_type" varchar(30) NOT NULL,
	"risk_level" varchar(20) NOT NULL,
	"predicted_demurrage_days" integer,
	"predicted_detention_days" integer,
	"predicted_amount" numeric(12, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"confidence_score" numeric(5, 2),
	"model_version" varchar(50),
	"input_features" jsonb,
	"trigger_factors" jsonb,
	"recommendations" jsonb,
	"ai_insights" text,
	"alert_sent" boolean DEFAULT false,
	"alert_sent_at" timestamp with time zone,
	"actual_outcome" text,
	"accuracy" numeric(5, 2),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ddm_waivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"waiver_ref" varchar(50) NOT NULL,
	"waiver_type" varchar(30) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"container_number" varchar(20),
	"invoice_ref" varchar(50),
	"original_amount" numeric(12, 2) NOT NULL,
	"waived_amount" numeric(12, 2) NOT NULL,
	"waiver_percent" numeric(5, 2),
	"remaining_amount" numeric(12, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"reason" text NOT NULL,
	"justification" text,
	"requested_by_name" varchar(255),
	"requested_date" timestamp with time zone NOT NULL,
	"approved_by_name" varchar(255),
	"approved_date" timestamp with time zone,
	"approval_level" integer,
	"conditions" text,
	"expiry_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ddm_demurrage_calculations" ADD CONSTRAINT "ddm_demurrage_calculations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ddm_detention_trackings" ADD CONSTRAINT "ddm_detention_trackings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ddm_disputes" ADD CONSTRAINT "ddm_disputes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ddm_free_time_rules" ADD CONSTRAINT "ddm_free_time_rules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ddm_invoices" ADD CONSTRAINT "ddm_invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ddm_notifications" ADD CONSTRAINT "ddm_notifications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ddm_predictions" ADD CONSTRAINT "ddm_predictions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ddm_waivers" ADD CONSTRAINT "ddm_waivers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ddm_demurrage_calc_tenant_idx" ON "ddm_demurrage_calculations" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ddm_demurrage_calc_ref_tenant_idx" ON "ddm_demurrage_calculations" USING btree ("tenant_id","calculation_ref");--> statement-breakpoint
CREATE INDEX "ddm_demurrage_calc_container_idx" ON "ddm_demurrage_calculations" USING btree ("tenant_id","container_number");--> statement-breakpoint
CREATE INDEX "ddm_demurrage_calc_customer_idx" ON "ddm_demurrage_calculations" USING btree ("tenant_id","customer_name");--> statement-breakpoint
CREATE INDEX "ddm_demurrage_calc_port_idx" ON "ddm_demurrage_calculations" USING btree ("tenant_id","port_name");--> statement-breakpoint
CREATE INDEX "ddm_demurrage_calc_status_idx" ON "ddm_demurrage_calculations" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "ddm_demurrage_calc_discharge_idx" ON "ddm_demurrage_calculations" USING btree ("tenant_id","discharge_date");--> statement-breakpoint
CREATE INDEX "ddm_demurrage_calc_created_idx" ON "ddm_demurrage_calculations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ddm_demurrage_calc_deleted_idx" ON "ddm_demurrage_calculations" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ddm_detention_track_tenant_idx" ON "ddm_detention_trackings" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ddm_detention_track_ref_tenant_idx" ON "ddm_detention_trackings" USING btree ("tenant_id","tracking_ref");--> statement-breakpoint
CREATE INDEX "ddm_detention_track_container_idx" ON "ddm_detention_trackings" USING btree ("tenant_id","container_number");--> statement-breakpoint
CREATE INDEX "ddm_detention_track_customer_idx" ON "ddm_detention_trackings" USING btree ("tenant_id","customer_name");--> statement-breakpoint
CREATE INDEX "ddm_detention_track_status_idx" ON "ddm_detention_trackings" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "ddm_detention_track_gate_out_idx" ON "ddm_detention_trackings" USING btree ("tenant_id","gate_out_date");--> statement-breakpoint
CREATE INDEX "ddm_detention_track_created_idx" ON "ddm_detention_trackings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ddm_detention_track_deleted_idx" ON "ddm_detention_trackings" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ddm_disputes_tenant_idx" ON "ddm_disputes" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ddm_disputes_ref_tenant_idx" ON "ddm_disputes" USING btree ("tenant_id","dispute_ref");--> statement-breakpoint
CREATE INDEX "ddm_disputes_customer_idx" ON "ddm_disputes" USING btree ("tenant_id","customer_name");--> statement-breakpoint
CREATE INDEX "ddm_disputes_type_idx" ON "ddm_disputes" USING btree ("tenant_id","dispute_type");--> statement-breakpoint
CREATE INDEX "ddm_disputes_status_idx" ON "ddm_disputes" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "ddm_disputes_filed_idx" ON "ddm_disputes" USING btree ("tenant_id","filed_date");--> statement-breakpoint
CREATE INDEX "ddm_disputes_created_idx" ON "ddm_disputes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ddm_disputes_deleted_idx" ON "ddm_disputes" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ddm_free_time_rules_tenant_idx" ON "ddm_free_time_rules" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ddm_free_time_rules_ref_tenant_idx" ON "ddm_free_time_rules" USING btree ("tenant_id","rule_ref");--> statement-breakpoint
CREATE INDEX "ddm_free_time_rules_type_idx" ON "ddm_free_time_rules" USING btree ("tenant_id","rule_type");--> statement-breakpoint
CREATE INDEX "ddm_free_time_rules_port_idx" ON "ddm_free_time_rules" USING btree ("tenant_id","port_name");--> statement-breakpoint
CREATE INDEX "ddm_free_time_rules_status_idx" ON "ddm_free_time_rules" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "ddm_free_time_rules_created_idx" ON "ddm_free_time_rules" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ddm_free_time_rules_deleted_idx" ON "ddm_free_time_rules" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ddm_invoices_tenant_idx" ON "ddm_invoices" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ddm_invoices_ref_tenant_idx" ON "ddm_invoices" USING btree ("tenant_id","invoice_ref");--> statement-breakpoint
CREATE INDEX "ddm_invoices_customer_idx" ON "ddm_invoices" USING btree ("tenant_id","customer_name");--> statement-breakpoint
CREATE INDEX "ddm_invoices_type_idx" ON "ddm_invoices" USING btree ("tenant_id","invoice_type");--> statement-breakpoint
CREATE INDEX "ddm_invoices_status_idx" ON "ddm_invoices" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "ddm_invoices_date_idx" ON "ddm_invoices" USING btree ("tenant_id","invoice_date");--> statement-breakpoint
CREATE INDEX "ddm_invoices_due_idx" ON "ddm_invoices" USING btree ("tenant_id","due_date");--> statement-breakpoint
CREATE INDEX "ddm_invoices_created_idx" ON "ddm_invoices" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ddm_invoices_deleted_idx" ON "ddm_invoices" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ddm_notifications_tenant_idx" ON "ddm_notifications" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ddm_notifications_ref_tenant_idx" ON "ddm_notifications" USING btree ("tenant_id","notification_ref");--> statement-breakpoint
CREATE INDEX "ddm_notifications_customer_idx" ON "ddm_notifications" USING btree ("tenant_id","customer_name");--> statement-breakpoint
CREATE INDEX "ddm_notifications_type_idx" ON "ddm_notifications" USING btree ("tenant_id","notification_type");--> statement-breakpoint
CREATE INDEX "ddm_notifications_channel_idx" ON "ddm_notifications" USING btree ("tenant_id","channel");--> statement-breakpoint
CREATE INDEX "ddm_notifications_status_idx" ON "ddm_notifications" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "ddm_notifications_scheduled_idx" ON "ddm_notifications" USING btree ("tenant_id","scheduled_at");--> statement-breakpoint
CREATE INDEX "ddm_notifications_created_idx" ON "ddm_notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ddm_notifications_deleted_idx" ON "ddm_notifications" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ddm_predictions_tenant_idx" ON "ddm_predictions" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ddm_predictions_ref_tenant_idx" ON "ddm_predictions" USING btree ("tenant_id","prediction_ref");--> statement-breakpoint
CREATE INDEX "ddm_predictions_container_idx" ON "ddm_predictions" USING btree ("tenant_id","container_number");--> statement-breakpoint
CREATE INDEX "ddm_predictions_customer_idx" ON "ddm_predictions" USING btree ("tenant_id","customer_name");--> statement-breakpoint
CREATE INDEX "ddm_predictions_risk_idx" ON "ddm_predictions" USING btree ("tenant_id","risk_level");--> statement-breakpoint
CREATE INDEX "ddm_predictions_status_idx" ON "ddm_predictions" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "ddm_predictions_created_idx" ON "ddm_predictions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ddm_predictions_deleted_idx" ON "ddm_predictions" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ddm_waivers_tenant_idx" ON "ddm_waivers" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ddm_waivers_ref_tenant_idx" ON "ddm_waivers" USING btree ("tenant_id","waiver_ref");--> statement-breakpoint
CREATE INDEX "ddm_waivers_customer_idx" ON "ddm_waivers" USING btree ("tenant_id","customer_name");--> statement-breakpoint
CREATE INDEX "ddm_waivers_type_idx" ON "ddm_waivers" USING btree ("tenant_id","waiver_type");--> statement-breakpoint
CREATE INDEX "ddm_waivers_status_idx" ON "ddm_waivers" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "ddm_waivers_created_idx" ON "ddm_waivers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ddm_waivers_deleted_idx" ON "ddm_waivers" USING btree ("deleted_at");