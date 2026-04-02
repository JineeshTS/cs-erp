CREATE TABLE "odm_bills_of_lading" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"bl_number" varchar(50) NOT NULL,
	"bl_type" varchar(30) DEFAULT 'original' NOT NULL,
	"bl_status" varchar(30) DEFAULT 'draft' NOT NULL,
	"booking_reference" varchar(50),
	"shipper_id" uuid,
	"shipper_name" varchar(255) NOT NULL,
	"shipper_address" text,
	"consignee_id" uuid,
	"consignee_name" varchar(255) NOT NULL,
	"consignee_address" text,
	"notify_party_name" varchar(255),
	"notify_party_address" text,
	"vessel_name" varchar(100),
	"voyage_number" varchar(50),
	"port_of_loading" varchar(10),
	"port_of_discharge" varchar(10),
	"place_of_receipt" varchar(100),
	"place_of_delivery" varchar(100),
	"date_of_issue" date,
	"on_board_date" date,
	"freight_terms" varchar(20) DEFAULT 'prepaid',
	"payment_terms" varchar(30),
	"number_of_originals" integer DEFAULT 3,
	"container_count" integer,
	"gross_weight" integer,
	"weight_unit" varchar(5) DEFAULT 'KG',
	"volume" integer,
	"volume_unit" varchar(5) DEFAULT 'CBM',
	"cargo_description" text,
	"marks_and_numbers" text,
	"special_instructions" text,
	"surrendered_at" timestamp with time zone,
	"released_at" timestamp with time zone,
	"printed_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "odm_bl_charges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"bl_id" uuid NOT NULL,
	"charge_code" varchar(30) NOT NULL,
	"charge_name" varchar(255) NOT NULL,
	"charge_type" varchar(20) NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"prepaid_collect" varchar(10) DEFAULT 'prepaid',
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "odm_bl_containers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"bl_id" uuid NOT NULL,
	"container_number" varchar(20) NOT NULL,
	"seal_number" varchar(30),
	"container_type" varchar(10),
	"container_size" varchar(5),
	"gross_weight" integer,
	"tare_weight" integer,
	"net_weight" integer,
	"volume_cbm" integer,
	"package_count" integer,
	"package_type" varchar(30),
	"cargo_description" text,
	"hs_code" varchar(20),
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "odm_cargo_tracking_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"bl_id" uuid,
	"container_number" varchar(20),
	"event_type" varchar(30) NOT NULL,
	"event_code" varchar(20) NOT NULL,
	"event_description" varchar(500),
	"event_location" varchar(100),
	"event_port" varchar(10),
	"event_date" timestamp with time zone NOT NULL,
	"reported_by" varchar(255),
	"vessel_name" varchar(100),
	"voyage_number" varchar(50),
	"is_actual" boolean DEFAULT true NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "odm_document_amendments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"bl_id" uuid NOT NULL,
	"amendment_number" varchar(30) NOT NULL,
	"amendment_type" varchar(30) NOT NULL,
	"field_changed" varchar(100) NOT NULL,
	"old_value" text,
	"new_value" text,
	"reason" text,
	"requested_by" uuid,
	"requested_at" timestamp with time zone,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"fee" integer,
	"currency" varchar(3) DEFAULT 'USD',
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "odm_manifest_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"manifest_id" uuid NOT NULL,
	"bl_id" uuid,
	"bl_number" varchar(50),
	"container_number" varchar(20),
	"shipper_name" varchar(255),
	"consignee_name" varchar(255),
	"cargo_description" text,
	"hs_code" varchar(20),
	"package_count" integer,
	"package_type" varchar(30),
	"gross_weight" integer,
	"volume_cbm" integer,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "odm_manifests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"manifest_number" varchar(50) NOT NULL,
	"manifest_type" varchar(30) DEFAULT 'export' NOT NULL,
	"vessel_name" varchar(100) NOT NULL,
	"voyage_number" varchar(50) NOT NULL,
	"port_of_loading" varchar(10),
	"port_of_discharge" varchar(10),
	"estimated_departure" timestamp with time zone,
	"estimated_arrival" timestamp with time zone,
	"total_bls" integer DEFAULT 0,
	"total_containers" integer DEFAULT 0,
	"total_weight" integer,
	"weight_unit" varchar(5) DEFAULT 'KG',
	"submitted_to" varchar(100),
	"submitted_at" timestamp with time zone,
	"submitted_by" uuid,
	"acknowledged_at" timestamp with time zone,
	"status" varchar(30) DEFAULT 'draft' NOT NULL,
	"rejection_reason" text,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "odm_regulatory_filings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"filing_reference" varchar(50) NOT NULL,
	"filing_type" varchar(30) NOT NULL,
	"regulatory_body" varchar(50) NOT NULL,
	"country" varchar(3) NOT NULL,
	"bl_id" uuid,
	"bl_number" varchar(50),
	"vessel_name" varchar(100),
	"voyage_number" varchar(50),
	"port_of_loading" varchar(10),
	"port_of_discharge" varchar(10),
	"filing_deadline" timestamp with time zone,
	"filed_at" timestamp with time zone,
	"filed_by" uuid,
	"response_received_at" timestamp with time zone,
	"response_code" varchar(20),
	"response_message" text,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"retry_count" integer DEFAULT 0,
	"shipper_name" varchar(255),
	"consignee_name" varchar(255),
	"seller_name" varchar(255),
	"buyer_name" varchar(255),
	"manufacturer_name" varchar(255),
	"hs_code" varchar(20),
	"cargo_description" text,
	"container_number" varchar(20),
	"seal_number" varchar(30),
	"gross_weight" integer,
	"filing_data" jsonb,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "odm_shipping_instructions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"si_reference" varchar(50) NOT NULL,
	"bl_id" uuid,
	"booking_reference" varchar(50),
	"customer_id" uuid,
	"customer_name" varchar(255),
	"shipper_name" varchar(255) NOT NULL,
	"shipper_address" text,
	"consignee_name" varchar(255) NOT NULL,
	"consignee_address" text,
	"notify_party_name" varchar(255),
	"cargo_description" text,
	"special_instructions" text,
	"submitted_at" timestamp with time zone,
	"submitted_by" uuid,
	"approved_at" timestamp with time zone,
	"approved_by" uuid,
	"status" varchar(30) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "odm_vgm_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"vgm_reference" varchar(50) NOT NULL,
	"container_number" varchar(20) NOT NULL,
	"bl_id" uuid,
	"bl_number" varchar(50),
	"booking_reference" varchar(50),
	"weighing_method" varchar(10) NOT NULL,
	"verified_gross_mass" integer NOT NULL,
	"tare_weight" integer,
	"cargo_weight" integer,
	"dunnage_weight" integer,
	"weight_unit" varchar(5) DEFAULT 'KG' NOT NULL,
	"weighing_date" date NOT NULL,
	"weighing_location" varchar(255),
	"weighbridge_id" varchar(50),
	"certified_by" varchar(255) NOT NULL,
	"certification_number" varchar(100),
	"shipper_name" varchar(255),
	"terminal_name" varchar(255),
	"submitted_at" timestamp with time zone,
	"submitted_by" uuid,
	"verified_at" timestamp with time zone,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"discrepancy_flag" boolean DEFAULT false NOT NULL,
	"discrepancy_notes" text,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "odm_bills_of_lading" ADD CONSTRAINT "odm_bills_of_lading_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odm_bl_charges" ADD CONSTRAINT "odm_bl_charges_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odm_bl_charges" ADD CONSTRAINT "odm_bl_charges_bl_id_odm_bills_of_lading_id_fk" FOREIGN KEY ("bl_id") REFERENCES "public"."odm_bills_of_lading"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odm_bl_containers" ADD CONSTRAINT "odm_bl_containers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odm_bl_containers" ADD CONSTRAINT "odm_bl_containers_bl_id_odm_bills_of_lading_id_fk" FOREIGN KEY ("bl_id") REFERENCES "public"."odm_bills_of_lading"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odm_cargo_tracking_events" ADD CONSTRAINT "odm_cargo_tracking_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odm_cargo_tracking_events" ADD CONSTRAINT "odm_cargo_tracking_events_bl_id_odm_bills_of_lading_id_fk" FOREIGN KEY ("bl_id") REFERENCES "public"."odm_bills_of_lading"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odm_document_amendments" ADD CONSTRAINT "odm_document_amendments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odm_document_amendments" ADD CONSTRAINT "odm_document_amendments_bl_id_odm_bills_of_lading_id_fk" FOREIGN KEY ("bl_id") REFERENCES "public"."odm_bills_of_lading"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odm_manifest_items" ADD CONSTRAINT "odm_manifest_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odm_manifest_items" ADD CONSTRAINT "odm_manifest_items_manifest_id_odm_manifests_id_fk" FOREIGN KEY ("manifest_id") REFERENCES "public"."odm_manifests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odm_manifest_items" ADD CONSTRAINT "odm_manifest_items_bl_id_odm_bills_of_lading_id_fk" FOREIGN KEY ("bl_id") REFERENCES "public"."odm_bills_of_lading"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odm_manifests" ADD CONSTRAINT "odm_manifests_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odm_regulatory_filings" ADD CONSTRAINT "odm_regulatory_filings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odm_regulatory_filings" ADD CONSTRAINT "odm_regulatory_filings_bl_id_odm_bills_of_lading_id_fk" FOREIGN KEY ("bl_id") REFERENCES "public"."odm_bills_of_lading"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odm_shipping_instructions" ADD CONSTRAINT "odm_shipping_instructions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odm_shipping_instructions" ADD CONSTRAINT "odm_shipping_instructions_bl_id_odm_bills_of_lading_id_fk" FOREIGN KEY ("bl_id") REFERENCES "public"."odm_bills_of_lading"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odm_vgm_records" ADD CONSTRAINT "odm_vgm_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odm_vgm_records" ADD CONSTRAINT "odm_vgm_records_bl_id_odm_bills_of_lading_id_fk" FOREIGN KEY ("bl_id") REFERENCES "public"."odm_bills_of_lading"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "odm_bl_tenant_id_idx" ON "odm_bills_of_lading" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "odm_bl_tenant_number_idx" ON "odm_bills_of_lading" USING btree ("tenant_id","bl_number");--> statement-breakpoint
CREATE INDEX "odm_bl_bl_type_idx" ON "odm_bills_of_lading" USING btree ("bl_type");--> statement-breakpoint
CREATE INDEX "odm_bl_bl_status_idx" ON "odm_bills_of_lading" USING btree ("bl_status");--> statement-breakpoint
CREATE INDEX "odm_bl_booking_ref_idx" ON "odm_bills_of_lading" USING btree ("booking_reference");--> statement-breakpoint
CREATE INDEX "odm_bl_vessel_name_idx" ON "odm_bills_of_lading" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "odm_bl_port_loading_idx" ON "odm_bills_of_lading" USING btree ("port_of_loading");--> statement-breakpoint
CREATE INDEX "odm_bl_port_discharge_idx" ON "odm_bills_of_lading" USING btree ("port_of_discharge");--> statement-breakpoint
CREATE INDEX "odm_bl_charges_tenant_id_idx" ON "odm_bl_charges" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "odm_bl_charges_bl_id_idx" ON "odm_bl_charges" USING btree ("bl_id");--> statement-breakpoint
CREATE INDEX "odm_bl_charges_charge_code_idx" ON "odm_bl_charges" USING btree ("charge_code");--> statement-breakpoint
CREATE INDEX "odm_bl_containers_tenant_id_idx" ON "odm_bl_containers" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "odm_bl_containers_bl_id_idx" ON "odm_bl_containers" USING btree ("bl_id");--> statement-breakpoint
CREATE INDEX "odm_bl_containers_container_number_idx" ON "odm_bl_containers" USING btree ("container_number");--> statement-breakpoint
CREATE INDEX "odm_tracking_tenant_id_idx" ON "odm_cargo_tracking_events" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "odm_tracking_bl_id_idx" ON "odm_cargo_tracking_events" USING btree ("bl_id");--> statement-breakpoint
CREATE INDEX "odm_tracking_container_number_idx" ON "odm_cargo_tracking_events" USING btree ("container_number");--> statement-breakpoint
CREATE INDEX "odm_tracking_event_type_idx" ON "odm_cargo_tracking_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "odm_tracking_event_code_idx" ON "odm_cargo_tracking_events" USING btree ("event_code");--> statement-breakpoint
CREATE INDEX "odm_tracking_event_date_idx" ON "odm_cargo_tracking_events" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX "odm_amendments_tenant_id_idx" ON "odm_document_amendments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "odm_amendments_bl_id_idx" ON "odm_document_amendments" USING btree ("bl_id");--> statement-breakpoint
CREATE INDEX "odm_amendments_amendment_type_idx" ON "odm_document_amendments" USING btree ("amendment_type");--> statement-breakpoint
CREATE INDEX "odm_amendments_status_idx" ON "odm_document_amendments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "odm_manifest_items_tenant_id_idx" ON "odm_manifest_items" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "odm_manifest_items_manifest_id_idx" ON "odm_manifest_items" USING btree ("manifest_id");--> statement-breakpoint
CREATE INDEX "odm_manifest_items_bl_id_idx" ON "odm_manifest_items" USING btree ("bl_id");--> statement-breakpoint
CREATE INDEX "odm_manifest_items_container_number_idx" ON "odm_manifest_items" USING btree ("container_number");--> statement-breakpoint
CREATE INDEX "odm_manifests_tenant_id_idx" ON "odm_manifests" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "odm_manifests_tenant_number_idx" ON "odm_manifests" USING btree ("tenant_id","manifest_number");--> statement-breakpoint
CREATE INDEX "odm_manifests_manifest_type_idx" ON "odm_manifests" USING btree ("manifest_type");--> statement-breakpoint
CREATE INDEX "odm_manifests_vessel_name_idx" ON "odm_manifests" USING btree ("vessel_name");--> statement-breakpoint
CREATE INDEX "odm_manifests_status_idx" ON "odm_manifests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "odm_manifests_port_loading_idx" ON "odm_manifests" USING btree ("port_of_loading");--> statement-breakpoint
CREATE INDEX "odm_manifests_port_discharge_idx" ON "odm_manifests" USING btree ("port_of_discharge");--> statement-breakpoint
CREATE INDEX "odm_reg_filings_tenant_id_idx" ON "odm_regulatory_filings" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "odm_reg_filings_tenant_ref_idx" ON "odm_regulatory_filings" USING btree ("tenant_id","filing_reference");--> statement-breakpoint
CREATE INDEX "odm_reg_filings_filing_type_idx" ON "odm_regulatory_filings" USING btree ("filing_type");--> statement-breakpoint
CREATE INDEX "odm_reg_filings_regulatory_body_idx" ON "odm_regulatory_filings" USING btree ("regulatory_body");--> statement-breakpoint
CREATE INDEX "odm_reg_filings_country_idx" ON "odm_regulatory_filings" USING btree ("country");--> statement-breakpoint
CREATE INDEX "odm_reg_filings_bl_id_idx" ON "odm_regulatory_filings" USING btree ("bl_id");--> statement-breakpoint
CREATE INDEX "odm_reg_filings_status_idx" ON "odm_regulatory_filings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "odm_reg_filings_filing_deadline_idx" ON "odm_regulatory_filings" USING btree ("filing_deadline");--> statement-breakpoint
CREATE INDEX "odm_si_tenant_id_idx" ON "odm_shipping_instructions" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "odm_si_tenant_ref_idx" ON "odm_shipping_instructions" USING btree ("tenant_id","si_reference");--> statement-breakpoint
CREATE INDEX "odm_si_bl_id_idx" ON "odm_shipping_instructions" USING btree ("bl_id");--> statement-breakpoint
CREATE INDEX "odm_si_booking_ref_idx" ON "odm_shipping_instructions" USING btree ("booking_reference");--> statement-breakpoint
CREATE INDEX "odm_si_status_idx" ON "odm_shipping_instructions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "odm_si_customer_id_idx" ON "odm_shipping_instructions" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "odm_vgm_tenant_id_idx" ON "odm_vgm_records" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "odm_vgm_tenant_ref_idx" ON "odm_vgm_records" USING btree ("tenant_id","vgm_reference");--> statement-breakpoint
CREATE INDEX "odm_vgm_container_number_idx" ON "odm_vgm_records" USING btree ("container_number");--> statement-breakpoint
CREATE INDEX "odm_vgm_bl_id_idx" ON "odm_vgm_records" USING btree ("bl_id");--> statement-breakpoint
CREATE INDEX "odm_vgm_status_idx" ON "odm_vgm_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "odm_vgm_weighing_method_idx" ON "odm_vgm_records" USING btree ("weighing_method");--> statement-breakpoint
CREATE INDEX "odm_vgm_weighing_date_idx" ON "odm_vgm_records" USING btree ("weighing_date");--> statement-breakpoint
CREATE INDEX "odm_vgm_discrepancy_flag_idx" ON "odm_vgm_records" USING btree ("discrepancy_flag");