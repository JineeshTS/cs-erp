CREATE TABLE "pam_cash_to_masters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"transaction_ref" varchar(50) NOT NULL,
	"transaction_type" varchar(30) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"imo_number" varchar(20),
	"port_call_ref" varchar(50),
	"port_name" varchar(255),
	"master_name" varchar(255),
	"requested_amount" numeric(14, 2) NOT NULL,
	"approved_amount" numeric(14, 2),
	"disbursed_amount" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"exchange_rate" numeric(12, 6),
	"local_currency" varchar(3),
	"local_amount" numeric(14, 2),
	"purpose" text,
	"requested_by" varchar(255),
	"requested_at" timestamp with time zone,
	"approved_by" varchar(255),
	"approved_at" timestamp with time zone,
	"disbursed_by" varchar(255),
	"disbursed_at" timestamp with time zone,
	"receipts" jsonb,
	"settlement_date" timestamp with time zone,
	"settlement_ref" varchar(50),
	"status" varchar(20) DEFAULT 'requested' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pam_crew_change_coordinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"coordination_ref" varchar(50) NOT NULL,
	"coordination_type" varchar(30) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"imo_number" varchar(20),
	"port_call_ref" varchar(50),
	"port_name" varchar(255),
	"crew_member_name" varchar(255) NOT NULL,
	"crew_rank" varchar(100),
	"nationality" varchar(100),
	"passport_number" varchar(50),
	"seaman_book_number" varchar(50),
	"visa_required" boolean DEFAULT false,
	"visa_status" varchar(20),
	"flight_details" jsonb,
	"hotel_required" boolean DEFAULT false,
	"hotel_details" jsonb,
	"transport_arranged" boolean DEFAULT false,
	"transport_details" text,
	"scheduled_date" timestamp with time zone,
	"completed_date" timestamp with time zone,
	"estimated_cost" numeric(14, 2),
	"actual_cost" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"status" varchar(20) DEFAULT 'planned' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pam_disbursement_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"account_ref" varchar(50) NOT NULL,
	"account_type" varchar(30) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"imo_number" varchar(20),
	"port_call_ref" varchar(50),
	"port_name" varchar(255),
	"voyage_ref" varchar(50),
	"principal_name" varchar(255),
	"principal_ref" varchar(50),
	"line_items" jsonb,
	"subtotal" numeric(14, 2),
	"agency_fee" numeric(14, 2),
	"tax_amount" numeric(14, 2),
	"total_amount" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"advance_received" numeric(14, 2),
	"balance_due" numeric(14, 2),
	"proforma_ref" varchar(50),
	"proforma_amount" numeric(14, 2),
	"variance" numeric(14, 2),
	"variance_explanation" text,
	"issued_at" timestamp with time zone,
	"due_date" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"payment_ref" varchar(50),
	"approved_by" varchar(255),
	"approved_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pam_husbandry_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"service_ref" varchar(50) NOT NULL,
	"service_type" varchar(30) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"imo_number" varchar(20),
	"port_call_ref" varchar(50),
	"port_name" varchar(255),
	"supplier_name" varchar(255),
	"supplier_contact" varchar(255),
	"supplier_phone" varchar(50),
	"requested_date" timestamp with time zone,
	"delivery_date" timestamp with time zone,
	"completed_date" timestamp with time zone,
	"description" text,
	"quantity" integer,
	"unit" varchar(30),
	"estimated_cost" numeric(14, 2),
	"actual_cost" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"invoice_ref" varchar(50),
	"approved_by" varchar(255),
	"approved_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'requested' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pam_port_authority_communications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"comm_ref" varchar(50) NOT NULL,
	"comm_type" varchar(30) NOT NULL,
	"authority_name" varchar(255) NOT NULL,
	"authority_department" varchar(255),
	"contact_person" varchar(255),
	"contact_email" varchar(255),
	"contact_phone" varchar(50),
	"vessel_name" varchar(255),
	"imo_number" varchar(20),
	"port_call_ref" varchar(50),
	"port_name" varchar(255),
	"subject" varchar(500) NOT NULL,
	"message_body" text,
	"direction" varchar(10) DEFAULT 'outbound' NOT NULL,
	"priority" varchar(10) DEFAULT 'normal',
	"sent_at" timestamp with time zone,
	"received_at" timestamp with time zone,
	"response_required" boolean DEFAULT false,
	"response_deadline" timestamp with time zone,
	"response_text" text,
	"responded_at" timestamp with time zone,
	"attachments" jsonb,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pam_port_call_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"plan_ref" varchar(50) NOT NULL,
	"plan_type" varchar(30) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"imo_number" varchar(20),
	"voyage_ref" varchar(50),
	"port_name" varchar(255) NOT NULL,
	"port_code" varchar(10),
	"berth_name" varchar(100),
	"terminal_name" varchar(255),
	"agent_name" varchar(255),
	"agent_contact_email" varchar(255),
	"agent_contact_phone" varchar(50),
	"eta" timestamp with time zone,
	"etd" timestamp with time zone,
	"ata" timestamp with time zone,
	"atd" timestamp with time zone,
	"pilot_required" boolean DEFAULT false,
	"tug_required" boolean DEFAULT false,
	"tugs_count" integer,
	"cargo_ops_planned" jsonb,
	"services_required" jsonb,
	"special_instructions" text,
	"port_charges_estimate" numeric(14, 2),
	"port_charges_currency" varchar(3) DEFAULT 'USD',
	"status" varchar(20) DEFAULT 'planned' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pam_pre_arrival_checklists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"checklist_ref" varchar(50) NOT NULL,
	"checklist_type" varchar(30) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"imo_number" varchar(20),
	"port_call_ref" varchar(50),
	"port_name" varchar(255),
	"arrival_date" timestamp with time zone,
	"documents_due" timestamp with time zone,
	"checklist_items" jsonb,
	"completed_count" integer DEFAULT 0,
	"total_count" integer DEFAULT 0,
	"notifications_sent" jsonb,
	"last_notification_at" timestamp with time zone,
	"port_authority_notified" boolean DEFAULT false,
	"customs_notified" boolean DEFAULT false,
	"immigration_notified" boolean DEFAULT false,
	"health_authority_notified" boolean DEFAULT false,
	"assigned_to" varchar(255),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pam_vessel_clearances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"clearance_ref" varchar(50) NOT NULL,
	"clearance_type" varchar(30) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"imo_number" varchar(20),
	"port_call_ref" varchar(50),
	"port_name" varchar(255) NOT NULL,
	"flag_state" varchar(100),
	"last_port" varchar(255),
	"next_port" varchar(255),
	"gross_tonnage" numeric(12, 2),
	"net_tonnage" numeric(12, 2),
	"crew_count" integer,
	"passenger_count" integer,
	"cargo_description" text,
	"health_declaration" boolean DEFAULT false,
	"customs_clearance" boolean DEFAULT false,
	"immigration_clearance" boolean DEFAULT false,
	"port_health_clearance" boolean DEFAULT false,
	"quarantine_clearance" boolean DEFAULT false,
	"documents_submitted" jsonb,
	"authority_approvals" jsonb,
	"clearance_granted_at" timestamp with time zone,
	"clearance_granted_by" varchar(255),
	"valid_until" timestamp with time zone,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "pam_cash_to_masters" ADD CONSTRAINT "pam_cash_to_masters_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pam_crew_change_coordinations" ADD CONSTRAINT "pam_crew_change_coordinations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pam_disbursement_accounts" ADD CONSTRAINT "pam_disbursement_accounts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pam_husbandry_services" ADD CONSTRAINT "pam_husbandry_services_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pam_port_authority_communications" ADD CONSTRAINT "pam_port_authority_communications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pam_port_call_plans" ADD CONSTRAINT "pam_port_call_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pam_pre_arrival_checklists" ADD CONSTRAINT "pam_pre_arrival_checklists_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pam_vessel_clearances" ADD CONSTRAINT "pam_vessel_clearances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pam_cash_master_tenant_idx" ON "pam_cash_to_masters" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pam_cash_master_ref_idx" ON "pam_cash_to_masters" USING btree ("transaction_ref");--> statement-breakpoint
CREATE INDEX "pam_cash_master_status_idx" ON "pam_cash_to_masters" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pam_cash_master_type_idx" ON "pam_cash_to_masters" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "pam_cash_master_vessel_idx" ON "pam_cash_to_masters" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "pam_cash_master_deleted_idx" ON "pam_cash_to_masters" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "pam_crew_change_tenant_idx" ON "pam_crew_change_coordinations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pam_crew_change_ref_idx" ON "pam_crew_change_coordinations" USING btree ("coordination_ref");--> statement-breakpoint
CREATE INDEX "pam_crew_change_status_idx" ON "pam_crew_change_coordinations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pam_crew_change_type_idx" ON "pam_crew_change_coordinations" USING btree ("coordination_type");--> statement-breakpoint
CREATE INDEX "pam_crew_change_vessel_idx" ON "pam_crew_change_coordinations" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "pam_crew_change_scheduled_idx" ON "pam_crew_change_coordinations" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX "pam_crew_change_deleted_idx" ON "pam_crew_change_coordinations" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "pam_disbursement_acct_tenant_idx" ON "pam_disbursement_accounts" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pam_disbursement_acct_ref_idx" ON "pam_disbursement_accounts" USING btree ("account_ref");--> statement-breakpoint
CREATE INDEX "pam_disbursement_acct_status_idx" ON "pam_disbursement_accounts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pam_disbursement_acct_type_idx" ON "pam_disbursement_accounts" USING btree ("account_type");--> statement-breakpoint
CREATE INDEX "pam_disbursement_acct_vessel_idx" ON "pam_disbursement_accounts" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "pam_disbursement_acct_deleted_idx" ON "pam_disbursement_accounts" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "pam_husbandry_svc_tenant_idx" ON "pam_husbandry_services" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pam_husbandry_svc_ref_idx" ON "pam_husbandry_services" USING btree ("service_ref");--> statement-breakpoint
CREATE INDEX "pam_husbandry_svc_status_idx" ON "pam_husbandry_services" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pam_husbandry_svc_type_idx" ON "pam_husbandry_services" USING btree ("service_type");--> statement-breakpoint
CREATE INDEX "pam_husbandry_svc_vessel_idx" ON "pam_husbandry_services" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "pam_husbandry_svc_deleted_idx" ON "pam_husbandry_services" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "pam_port_auth_comm_tenant_idx" ON "pam_port_authority_communications" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pam_port_auth_comm_ref_idx" ON "pam_port_authority_communications" USING btree ("comm_ref");--> statement-breakpoint
CREATE INDEX "pam_port_auth_comm_status_idx" ON "pam_port_authority_communications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pam_port_auth_comm_type_idx" ON "pam_port_authority_communications" USING btree ("comm_type");--> statement-breakpoint
CREATE INDEX "pam_port_auth_comm_vessel_idx" ON "pam_port_authority_communications" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "pam_port_auth_comm_deleted_idx" ON "pam_port_authority_communications" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "pam_port_call_plan_tenant_idx" ON "pam_port_call_plans" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pam_port_call_plan_ref_idx" ON "pam_port_call_plans" USING btree ("plan_ref");--> statement-breakpoint
CREATE INDEX "pam_port_call_plan_status_idx" ON "pam_port_call_plans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pam_port_call_plan_vessel_idx" ON "pam_port_call_plans" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "pam_port_call_plan_port_idx" ON "pam_port_call_plans" USING btree ("port_name");--> statement-breakpoint
CREATE INDEX "pam_port_call_plan_eta_idx" ON "pam_port_call_plans" USING btree ("eta");--> statement-breakpoint
CREATE INDEX "pam_port_call_plan_deleted_idx" ON "pam_port_call_plans" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "pam_pre_arrival_cl_tenant_idx" ON "pam_pre_arrival_checklists" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pam_pre_arrival_cl_ref_idx" ON "pam_pre_arrival_checklists" USING btree ("checklist_ref");--> statement-breakpoint
CREATE INDEX "pam_pre_arrival_cl_status_idx" ON "pam_pre_arrival_checklists" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pam_pre_arrival_cl_vessel_idx" ON "pam_pre_arrival_checklists" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "pam_pre_arrival_cl_arrival_idx" ON "pam_pre_arrival_checklists" USING btree ("arrival_date");--> statement-breakpoint
CREATE INDEX "pam_pre_arrival_cl_deleted_idx" ON "pam_pre_arrival_checklists" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "pam_vessel_cl_tenant_idx" ON "pam_vessel_clearances" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pam_vessel_cl_ref_idx" ON "pam_vessel_clearances" USING btree ("clearance_ref");--> statement-breakpoint
CREATE INDEX "pam_vessel_cl_status_idx" ON "pam_vessel_clearances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pam_vessel_cl_type_idx" ON "pam_vessel_clearances" USING btree ("clearance_type");--> statement-breakpoint
CREATE INDEX "pam_vessel_cl_vessel_idx" ON "pam_vessel_clearances" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "pam_vessel_cl_port_idx" ON "pam_vessel_clearances" USING btree ("port_name");--> statement-breakpoint
CREATE INDEX "pam_vessel_cl_deleted_idx" ON "pam_vessel_clearances" USING btree ("deleted_at");