CREATE TABLE "ccr_aeo_compliances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"aeo_ref" varchar(50) NOT NULL,
	"aeo_type" varchar(30) NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"company_registration" varchar(100),
	"authority_name" varchar(255),
	"certificate_number" varchar(100),
	"certificate_issued_at" timestamp with time zone,
	"certificate_expires_at" timestamp with time zone,
	"audit_frequency" varchar(20),
	"last_audit_date" timestamp with time zone,
	"next_audit_date" timestamp with time zone,
	"audit_result" varchar(20),
	"compliance_score" numeric(5, 2),
	"risk_category" varchar(20),
	"benefits_granted" jsonb,
	"corrective_actions" jsonb,
	"contact_name" varchar(255),
	"contact_email" varchar(255),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ccr_duty_calculations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"calculation_ref" varchar(50) NOT NULL,
	"clearance_ref" varchar(50),
	"hs_code" varchar(20) NOT NULL,
	"hs_description" text,
	"origin_country" varchar(100),
	"destination_country" varchar(100),
	"valuation_method" varchar(30),
	"cif_value" numeric(14, 2) NOT NULL,
	"cif_currency" varchar(3) NOT NULL,
	"exchange_rate" numeric(12, 6),
	"duty_rate" numeric(8, 4),
	"duty_amount" numeric(14, 2),
	"vat_rate" numeric(8, 4),
	"vat_amount" numeric(14, 2),
	"excise_rate" numeric(8, 4),
	"excise_amount" numeric(14, 2),
	"antidumping_duty" numeric(14, 2),
	"safeguard_duty" numeric(14, 2),
	"total_duty_tax" numeric(14, 2),
	"preferential_tariff" boolean DEFAULT false,
	"fta_reference" varchar(100),
	"exemption_code" varchar(30),
	"exemption_reason" text,
	"calculated_by_name" varchar(255),
	"calculated_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ccr_export_filings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"filing_ref" varchar(50) NOT NULL,
	"declaration_type" varchar(30) NOT NULL,
	"declaration_number" varchar(50),
	"customs_office" varchar(255),
	"exporter_name" varchar(255) NOT NULL,
	"exporter_code" varchar(50),
	"exporter_tax_id" varchar(50),
	"consignee_name" varchar(255),
	"consignee_country" varchar(100),
	"bl_number" varchar(50),
	"container_number" varchar(20),
	"vessel_name" varchar(255),
	"voyage_number" varchar(50),
	"port_of_loading" varchar(255) NOT NULL,
	"port_of_discharge" varchar(255),
	"cargo_description" text,
	"hs_code" varchar(20),
	"gross_weight_kg" numeric(12, 2),
	"number_of_packages" integer,
	"fob_value" numeric(14, 2),
	"currency" varchar(3),
	"export_license_required" boolean DEFAULT false,
	"export_license_number" varchar(50),
	"filed_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"broker_name" varchar(255),
	"broker_license" varchar(50),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ccr_imo_regulations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"regulation_ref" varchar(50) NOT NULL,
	"regulation_type" varchar(30) NOT NULL,
	"imo_reference" varchar(100),
	"title" varchar(500) NOT NULL,
	"issuing_body" varchar(100),
	"convention_name" varchar(255),
	"published_at" timestamp with time zone,
	"effective_at" timestamp with time zone,
	"compliance_deadline" timestamp with time zone,
	"applicable_to" jsonb,
	"summary" text,
	"impact_assessment" text,
	"compliance_actions" jsonb,
	"implementation_progress" numeric(5, 2),
	"responsible_person" varchar(255),
	"document_url" varchar(500),
	"supersedes" varchar(100),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ccr_import_clearances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"clearance_ref" varchar(50) NOT NULL,
	"declaration_type" varchar(30) NOT NULL,
	"declaration_number" varchar(50),
	"customs_office" varchar(255),
	"importer_name" varchar(255) NOT NULL,
	"importer_code" varchar(50),
	"importer_tax_id" varchar(50),
	"consignment_ref" varchar(50),
	"bl_number" varchar(50),
	"container_number" varchar(20),
	"vessel_name" varchar(255),
	"voyage_number" varchar(50),
	"port_of_origin" varchar(255),
	"port_of_entry" varchar(255) NOT NULL,
	"cargo_description" text,
	"hs_code" varchar(20),
	"gross_weight_kg" numeric(12, 2),
	"number_of_packages" integer,
	"invoice_value" numeric(14, 2),
	"invoice_currency" varchar(3),
	"customs_value" numeric(14, 2),
	"duty_amount" numeric(14, 2),
	"vat_amount" numeric(14, 2),
	"total_taxes" numeric(14, 2),
	"payment_method" varchar(30),
	"filed_at" timestamp with time zone,
	"cleared_at" timestamp with time zone,
	"release_order_number" varchar(50),
	"inspection_required" boolean DEFAULT false,
	"inspection_result" varchar(20),
	"broker_name" varchar(255),
	"broker_license" varchar(50),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ccr_isps_compliances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"isps_ref" varchar(50) NOT NULL,
	"facility_type" varchar(30) NOT NULL,
	"facility_name" varchar(255) NOT NULL,
	"facility_code" varchar(50),
	"imo_number" varchar(20),
	"security_level" varchar(10) NOT NULL,
	"pfso_name" varchar(255),
	"pfso_contact" varchar(100),
	"sso_name" varchar(255),
	"security_plan_ref" varchar(100),
	"security_plan_approved_at" timestamp with time zone,
	"last_drill_date" timestamp with time zone,
	"next_drill_date" timestamp with time zone,
	"last_audit_date" timestamp with time zone,
	"next_audit_date" timestamp with time zone,
	"audit_result" varchar(20),
	"issc_number" varchar(50),
	"issc_expires_at" timestamp with time zone,
	"declarations_of_security" jsonb,
	"incidents" jsonb,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ccr_psc_preparations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"psc_ref" varchar(50) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"imo_number" varchar(20),
	"flag_state" varchar(100),
	"classification_society" varchar(255),
	"inspection_port" varchar(255) NOT NULL,
	"inspection_date" timestamp with time zone,
	"inspector_name" varchar(255),
	"inspection_type" varchar(30),
	"mou_regime" varchar(30),
	"target_factor" numeric(8, 4),
	"deficiencies_found" integer DEFAULT 0,
	"deficiency_details" jsonb,
	"detention_issued" boolean DEFAULT false,
	"detention_reason" text,
	"corrective_actions" jsonb,
	"rectified_at" timestamp with time zone,
	"certificates_checked" jsonb,
	"overall_result" varchar(20),
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ccr_transit_procedures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"transit_ref" varchar(50) NOT NULL,
	"procedure_type" varchar(30) NOT NULL,
	"declaration_number" varchar(50),
	"customs_office_origin" varchar(255),
	"customs_office_destination" varchar(255),
	"principal_name" varchar(255) NOT NULL,
	"principal_code" varchar(50),
	"guarantee_type" varchar(30),
	"guarantee_amount" numeric(14, 2),
	"guarantee_currency" varchar(3),
	"guarantee_reference" varchar(100),
	"container_number" varchar(20),
	"seal_number" varchar(30),
	"cargo_description" text,
	"hs_code" varchar(20),
	"gross_weight_kg" numeric(12, 2),
	"origin_country" varchar(100),
	"destination_country" varchar(100),
	"route_description" text,
	"transit_start_at" timestamp with time zone,
	"transit_deadline_at" timestamp with time zone,
	"transit_completed_at" timestamp with time zone,
	"discharged" boolean DEFAULT false,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "ccr_aeo_compliances" ADD CONSTRAINT "ccr_aeo_compliances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ccr_duty_calculations" ADD CONSTRAINT "ccr_duty_calculations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ccr_export_filings" ADD CONSTRAINT "ccr_export_filings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ccr_imo_regulations" ADD CONSTRAINT "ccr_imo_regulations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ccr_import_clearances" ADD CONSTRAINT "ccr_import_clearances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ccr_isps_compliances" ADD CONSTRAINT "ccr_isps_compliances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ccr_psc_preparations" ADD CONSTRAINT "ccr_psc_preparations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ccr_transit_procedures" ADD CONSTRAINT "ccr_transit_procedures_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ccr_aeo_compl_tenant_idx" ON "ccr_aeo_compliances" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ccr_aeo_compl_ref_idx" ON "ccr_aeo_compliances" USING btree ("aeo_ref");--> statement-breakpoint
CREATE INDEX "ccr_aeo_compl_status_idx" ON "ccr_aeo_compliances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ccr_aeo_compl_company_idx" ON "ccr_aeo_compliances" USING btree ("company_name");--> statement-breakpoint
CREATE INDEX "ccr_aeo_compl_type_idx" ON "ccr_aeo_compliances" USING btree ("aeo_type");--> statement-breakpoint
CREATE INDEX "ccr_aeo_compl_deleted_idx" ON "ccr_aeo_compliances" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ccr_duty_calc_tenant_idx" ON "ccr_duty_calculations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ccr_duty_calc_ref_idx" ON "ccr_duty_calculations" USING btree ("calculation_ref");--> statement-breakpoint
CREATE INDEX "ccr_duty_calc_status_idx" ON "ccr_duty_calculations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ccr_duty_calc_hs_idx" ON "ccr_duty_calculations" USING btree ("hs_code");--> statement-breakpoint
CREATE INDEX "ccr_duty_calc_clearance_idx" ON "ccr_duty_calculations" USING btree ("clearance_ref");--> statement-breakpoint
CREATE INDEX "ccr_duty_calc_deleted_idx" ON "ccr_duty_calculations" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ccr_export_filings_tenant_idx" ON "ccr_export_filings" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ccr_export_filings_ref_idx" ON "ccr_export_filings" USING btree ("filing_ref");--> statement-breakpoint
CREATE INDEX "ccr_export_filings_status_idx" ON "ccr_export_filings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ccr_export_filings_exporter_idx" ON "ccr_export_filings" USING btree ("exporter_name");--> statement-breakpoint
CREATE INDEX "ccr_export_filings_hs_idx" ON "ccr_export_filings" USING btree ("hs_code");--> statement-breakpoint
CREATE INDEX "ccr_export_filings_deleted_idx" ON "ccr_export_filings" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ccr_imo_reg_tenant_idx" ON "ccr_imo_regulations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ccr_imo_reg_ref_idx" ON "ccr_imo_regulations" USING btree ("regulation_ref");--> statement-breakpoint
CREATE INDEX "ccr_imo_reg_status_idx" ON "ccr_imo_regulations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ccr_imo_reg_type_idx" ON "ccr_imo_regulations" USING btree ("regulation_type");--> statement-breakpoint
CREATE INDEX "ccr_imo_reg_effective_idx" ON "ccr_imo_regulations" USING btree ("effective_at");--> statement-breakpoint
CREATE INDEX "ccr_imo_reg_deadline_idx" ON "ccr_imo_regulations" USING btree ("compliance_deadline");--> statement-breakpoint
CREATE INDEX "ccr_imo_reg_deleted_idx" ON "ccr_imo_regulations" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ccr_import_clear_tenant_idx" ON "ccr_import_clearances" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ccr_import_clear_ref_idx" ON "ccr_import_clearances" USING btree ("clearance_ref");--> statement-breakpoint
CREATE INDEX "ccr_import_clear_status_idx" ON "ccr_import_clearances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ccr_import_clear_importer_idx" ON "ccr_import_clearances" USING btree ("importer_name");--> statement-breakpoint
CREATE INDEX "ccr_import_clear_hs_idx" ON "ccr_import_clearances" USING btree ("hs_code");--> statement-breakpoint
CREATE INDEX "ccr_import_clear_deleted_idx" ON "ccr_import_clearances" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ccr_isps_compl_tenant_idx" ON "ccr_isps_compliances" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ccr_isps_compl_ref_idx" ON "ccr_isps_compliances" USING btree ("isps_ref");--> statement-breakpoint
CREATE INDEX "ccr_isps_compl_status_idx" ON "ccr_isps_compliances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ccr_isps_compl_facility_idx" ON "ccr_isps_compliances" USING btree ("facility_name");--> statement-breakpoint
CREATE INDEX "ccr_isps_compl_level_idx" ON "ccr_isps_compliances" USING btree ("security_level");--> statement-breakpoint
CREATE INDEX "ccr_isps_compl_deleted_idx" ON "ccr_isps_compliances" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ccr_psc_prep_tenant_idx" ON "ccr_psc_preparations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ccr_psc_prep_ref_idx" ON "ccr_psc_preparations" USING btree ("psc_ref");--> statement-breakpoint
CREATE INDEX "ccr_psc_prep_status_idx" ON "ccr_psc_preparations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ccr_psc_prep_vessel_idx" ON "ccr_psc_preparations" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "ccr_psc_prep_port_idx" ON "ccr_psc_preparations" USING btree ("inspection_port");--> statement-breakpoint
CREATE INDEX "ccr_psc_prep_deleted_idx" ON "ccr_psc_preparations" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "ccr_transit_proc_tenant_idx" ON "ccr_transit_procedures" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ccr_transit_proc_ref_idx" ON "ccr_transit_procedures" USING btree ("transit_ref");--> statement-breakpoint
CREATE INDEX "ccr_transit_proc_status_idx" ON "ccr_transit_procedures" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ccr_transit_proc_principal_idx" ON "ccr_transit_procedures" USING btree ("principal_name");--> statement-breakpoint
CREATE INDEX "ccr_transit_proc_type_idx" ON "ccr_transit_procedures" USING btree ("procedure_type");--> statement-breakpoint
CREATE INDEX "ccr_transit_proc_deleted_idx" ON "ccr_transit_procedures" USING btree ("deleted_at");