CREATE TABLE "oog_cargo_acceptances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"acceptance_ref" varchar(50) NOT NULL,
	"booking_ref" varchar(50),
	"customer_name" varchar(255) NOT NULL,
	"customer_code" varchar(50),
	"cargo_description" text NOT NULL,
	"cargo_type" varchar(30) NOT NULL,
	"container_type" varchar(30) NOT NULL,
	"container_number" varchar(20),
	"length_cm" numeric(10, 2),
	"width_cm" numeric(10, 2),
	"height_cm" numeric(10, 2),
	"gross_weight_kg" numeric(12, 2) NOT NULL,
	"over_length_cm" numeric(10, 2),
	"over_width_cm" numeric(10, 2),
	"over_height_cm" numeric(10, 2),
	"measurement_validated" boolean DEFAULT false,
	"validated_by_name" varchar(255),
	"validated_at" timestamp with time zone,
	"origin_port" varchar(255) NOT NULL,
	"destination_port" varchar(255) NOT NULL,
	"vessel_name" varchar(255),
	"voyage_number" varchar(50),
	"special_handling" jsonb,
	"hazardous" boolean DEFAULT false,
	"photos_urls" jsonb,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oog_doc_permits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"document_ref" varchar(50) NOT NULL,
	"document_type" varchar(30) NOT NULL,
	"acceptance_ref" varchar(50),
	"container_number" varchar(20),
	"document_title" varchar(255) NOT NULL,
	"issuing_authority" varchar(255),
	"issue_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"permit_number" varchar(100),
	"permit_scope" varchar(100),
	"port_of_applicability" varchar(255),
	"country_of_applicability" varchar(100),
	"conditions_of_approval" text,
	"document_url" varchar(500),
	"verified_by_name" varchar(255),
	"verified_at" timestamp with time zone,
	"renewal_required" boolean DEFAULT false,
	"renewal_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oog_heavy_lifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"heavy_lift_ref" varchar(50) NOT NULL,
	"project_name" varchar(255) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"cargo_description" text NOT NULL,
	"number_of_pieces" integer NOT NULL,
	"total_weight_kg" numeric(14, 2) NOT NULL,
	"heaviest_piece_kg" numeric(14, 2),
	"longest_piece_cm" numeric(10, 2),
	"widest_piece_cm" numeric(10, 2),
	"tallest_piece_cm" numeric(10, 2),
	"lifting_method" varchar(50),
	"crane_capacity_tons" numeric(10, 2),
	"rigging_plan" jsonb,
	"origin_port" varchar(255) NOT NULL,
	"destination_port" varchar(255) NOT NULL,
	"vessel_name" varchar(255),
	"voyage_number" varchar(50),
	"estimated_load_date" timestamp with time zone,
	"estimated_discharge_date" timestamp with time zone,
	"coordinator_name" varchar(255),
	"surveyor_name" varchar(255),
	"survey_report_url" varchar(500),
	"insurance_coverage" varchar(100),
	"estimated_cost" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"status" varchar(20) DEFAULT 'planning' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oog_multi_modal_logistics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"logistics_ref" varchar(50) NOT NULL,
	"acceptance_ref" varchar(50),
	"container_number" varchar(20),
	"cargo_description" text,
	"transport_mode" varchar(30) NOT NULL,
	"carrier_name" varchar(255),
	"vehicle_id" varchar(50),
	"origin_location" varchar(255) NOT NULL,
	"destination_location" varchar(255) NOT NULL,
	"transit_points" jsonb,
	"route_restrictions" jsonb,
	"permit_required" boolean DEFAULT false,
	"permit_number" varchar(100),
	"escort_required" boolean DEFAULT false,
	"estimated_departure_at" timestamp with time zone,
	"estimated_arrival_at" timestamp with time zone,
	"actual_departure_at" timestamp with time zone,
	"actual_arrival_at" timestamp with time zone,
	"transport_cost" numeric(12, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"status" varchar(20) DEFAULT 'planned' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oog_port_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"approval_ref" varchar(50) NOT NULL,
	"acceptance_ref" varchar(50),
	"port_name" varchar(255) NOT NULL,
	"port_authority" varchar(255) NOT NULL,
	"vessel_name" varchar(255),
	"voyage_number" varchar(50),
	"container_number" varchar(20),
	"cargo_description" text,
	"oog_dimensions" jsonb,
	"gross_weight_kg" numeric(12, 2),
	"approval_type" varchar(30) NOT NULL,
	"submitted_at" timestamp with time zone,
	"submitted_by_name" varchar(255),
	"application_number" varchar(100),
	"approval_conditions" jsonb,
	"approved_at" timestamp with time zone,
	"approved_by_authority" varchar(255),
	"rejection_reason" text,
	"valid_from" timestamp with time zone,
	"valid_to" timestamp with time zone,
	"fees" numeric(12, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oog_securing_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"securing_ref" varchar(50) NOT NULL,
	"acceptance_ref" varchar(50),
	"container_number" varchar(20),
	"cargo_description" text NOT NULL,
	"gross_weight_kg" numeric(12, 2) NOT NULL,
	"center_of_gravity_x" numeric(10, 2),
	"center_of_gravity_y" numeric(10, 2),
	"center_of_gravity_z" numeric(10, 2),
	"lashing_method" varchar(50),
	"lashing_material" varchar(100),
	"number_of_lashings" integer,
	"blocking_method" varchar(50),
	"bracing_method" varchar(50),
	"dunnage_required" boolean DEFAULT false,
	"dunnage_material" varchar(100),
	"acceleration_forces" jsonb,
	"calculation_standard" varchar(50),
	"diagram_url" varchar(500),
	"verified_by_name" varchar(255),
	"verified_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oog_special_equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"equipment_ref" varchar(50) NOT NULL,
	"equipment_type" varchar(30) NOT NULL,
	"equipment_number" varchar(30),
	"equipment_name" varchar(255) NOT NULL,
	"manufacturer" varchar(255),
	"model_number" varchar(100),
	"max_load_capacity_kg" numeric(12, 2),
	"tare_weight_kg" numeric(12, 2),
	"internal_length_cm" numeric(10, 2),
	"internal_width_cm" numeric(10, 2),
	"internal_height_cm" numeric(10, 2),
	"door_opening_width_cm" numeric(10, 2),
	"door_opening_height_cm" numeric(10, 2),
	"certification_number" varchar(100),
	"certification_expiry" timestamp with time zone,
	"last_inspection_date" timestamp with time zone,
	"next_inspection_date" timestamp with time zone,
	"current_location" varchar(255),
	"ownership_type" varchar(20),
	"lease_reference" varchar(100),
	"available_from" timestamp with time zone,
	"status" varchar(20) DEFAULT 'available' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oog_stowage_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"stowage_ref" varchar(50) NOT NULL,
	"vessel_name" varchar(255) NOT NULL,
	"voyage_number" varchar(50) NOT NULL,
	"container_number" varchar(20),
	"container_type" varchar(30) NOT NULL,
	"bay_position" varchar(30),
	"row_position" varchar(30),
	"tier_position" varchar(30),
	"weight_kg" numeric(12, 2),
	"over_length_fore" numeric(10, 2),
	"over_length_aft" numeric(10, 2),
	"over_width_port" numeric(10, 2),
	"over_width_starboard" numeric(10, 2),
	"over_height" numeric(10, 2),
	"stackable" boolean DEFAULT false,
	"adjacent_slots" jsonb,
	"clearance_required" boolean DEFAULT false,
	"lashing_points" integer,
	"stowage_constraints" jsonb,
	"plan_approved" boolean DEFAULT false,
	"approved_by_name" varchar(255),
	"approved_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "oog_cargo_acceptances" ADD CONSTRAINT "oog_cargo_acceptances_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oog_doc_permits" ADD CONSTRAINT "oog_doc_permits_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oog_heavy_lifts" ADD CONSTRAINT "oog_heavy_lifts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oog_multi_modal_logistics" ADD CONSTRAINT "oog_multi_modal_logistics_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oog_port_approvals" ADD CONSTRAINT "oog_port_approvals_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oog_securing_plans" ADD CONSTRAINT "oog_securing_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oog_special_equipment" ADD CONSTRAINT "oog_special_equipment_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oog_stowage_plans" ADD CONSTRAINT "oog_stowage_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "oog_cargo_acc_tenant_idx" ON "oog_cargo_acceptances" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "oog_cargo_acc_ref_tenant_idx" ON "oog_cargo_acceptances" USING btree ("tenant_id","acceptance_ref");--> statement-breakpoint
CREATE INDEX "oog_cargo_acc_customer_idx" ON "oog_cargo_acceptances" USING btree ("tenant_id","customer_name");--> statement-breakpoint
CREATE INDEX "oog_cargo_acc_container_idx" ON "oog_cargo_acceptances" USING btree ("tenant_id","container_number");--> statement-breakpoint
CREATE INDEX "oog_cargo_acc_type_idx" ON "oog_cargo_acceptances" USING btree ("tenant_id","cargo_type");--> statement-breakpoint
CREATE INDEX "oog_cargo_acc_status_idx" ON "oog_cargo_acceptances" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "oog_cargo_acc_created_idx" ON "oog_cargo_acceptances" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "oog_cargo_acc_deleted_idx" ON "oog_cargo_acceptances" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "oog_doc_permit_tenant_idx" ON "oog_doc_permits" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "oog_doc_permit_ref_tenant_idx" ON "oog_doc_permits" USING btree ("tenant_id","document_ref");--> statement-breakpoint
CREATE INDEX "oog_doc_permit_type_idx" ON "oog_doc_permits" USING btree ("tenant_id","document_type");--> statement-breakpoint
CREATE INDEX "oog_doc_permit_acceptance_idx" ON "oog_doc_permits" USING btree ("tenant_id","acceptance_ref");--> statement-breakpoint
CREATE INDEX "oog_doc_permit_authority_idx" ON "oog_doc_permits" USING btree ("tenant_id","issuing_authority");--> statement-breakpoint
CREATE INDEX "oog_doc_permit_status_idx" ON "oog_doc_permits" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "oog_doc_permit_created_idx" ON "oog_doc_permits" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "oog_doc_permit_deleted_idx" ON "oog_doc_permits" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "oog_heavy_lift_tenant_idx" ON "oog_heavy_lifts" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "oog_heavy_lift_ref_tenant_idx" ON "oog_heavy_lifts" USING btree ("tenant_id","heavy_lift_ref");--> statement-breakpoint
CREATE INDEX "oog_heavy_lift_project_idx" ON "oog_heavy_lifts" USING btree ("tenant_id","project_name");--> statement-breakpoint
CREATE INDEX "oog_heavy_lift_customer_idx" ON "oog_heavy_lifts" USING btree ("tenant_id","customer_name");--> statement-breakpoint
CREATE INDEX "oog_heavy_lift_vessel_idx" ON "oog_heavy_lifts" USING btree ("tenant_id","vessel_name");--> statement-breakpoint
CREATE INDEX "oog_heavy_lift_status_idx" ON "oog_heavy_lifts" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "oog_heavy_lift_created_idx" ON "oog_heavy_lifts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "oog_heavy_lift_deleted_idx" ON "oog_heavy_lifts" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "oog_multi_modal_tenant_idx" ON "oog_multi_modal_logistics" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "oog_multi_modal_ref_tenant_idx" ON "oog_multi_modal_logistics" USING btree ("tenant_id","logistics_ref");--> statement-breakpoint
CREATE INDEX "oog_multi_modal_acceptance_idx" ON "oog_multi_modal_logistics" USING btree ("tenant_id","acceptance_ref");--> statement-breakpoint
CREATE INDEX "oog_multi_modal_mode_idx" ON "oog_multi_modal_logistics" USING btree ("tenant_id","transport_mode");--> statement-breakpoint
CREATE INDEX "oog_multi_modal_carrier_idx" ON "oog_multi_modal_logistics" USING btree ("tenant_id","carrier_name");--> statement-breakpoint
CREATE INDEX "oog_multi_modal_status_idx" ON "oog_multi_modal_logistics" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "oog_multi_modal_created_idx" ON "oog_multi_modal_logistics" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "oog_multi_modal_deleted_idx" ON "oog_multi_modal_logistics" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "oog_port_appr_tenant_idx" ON "oog_port_approvals" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "oog_port_appr_ref_tenant_idx" ON "oog_port_approvals" USING btree ("tenant_id","approval_ref");--> statement-breakpoint
CREATE INDEX "oog_port_appr_port_idx" ON "oog_port_approvals" USING btree ("tenant_id","port_name");--> statement-breakpoint
CREATE INDEX "oog_port_appr_authority_idx" ON "oog_port_approvals" USING btree ("tenant_id","port_authority");--> statement-breakpoint
CREATE INDEX "oog_port_appr_vessel_idx" ON "oog_port_approvals" USING btree ("tenant_id","vessel_name");--> statement-breakpoint
CREATE INDEX "oog_port_appr_type_idx" ON "oog_port_approvals" USING btree ("tenant_id","approval_type");--> statement-breakpoint
CREATE INDEX "oog_port_appr_status_idx" ON "oog_port_approvals" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "oog_port_appr_created_idx" ON "oog_port_approvals" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "oog_port_appr_deleted_idx" ON "oog_port_approvals" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "oog_securing_tenant_idx" ON "oog_securing_plans" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "oog_securing_ref_tenant_idx" ON "oog_securing_plans" USING btree ("tenant_id","securing_ref");--> statement-breakpoint
CREATE INDEX "oog_securing_acceptance_idx" ON "oog_securing_plans" USING btree ("tenant_id","acceptance_ref");--> statement-breakpoint
CREATE INDEX "oog_securing_container_idx" ON "oog_securing_plans" USING btree ("tenant_id","container_number");--> statement-breakpoint
CREATE INDEX "oog_securing_method_idx" ON "oog_securing_plans" USING btree ("tenant_id","lashing_method");--> statement-breakpoint
CREATE INDEX "oog_securing_status_idx" ON "oog_securing_plans" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "oog_securing_created_idx" ON "oog_securing_plans" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "oog_securing_deleted_idx" ON "oog_securing_plans" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "oog_spec_equip_tenant_idx" ON "oog_special_equipment" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "oog_spec_equip_ref_tenant_idx" ON "oog_special_equipment" USING btree ("tenant_id","equipment_ref");--> statement-breakpoint
CREATE INDEX "oog_spec_equip_type_idx" ON "oog_special_equipment" USING btree ("tenant_id","equipment_type");--> statement-breakpoint
CREATE INDEX "oog_spec_equip_number_idx" ON "oog_special_equipment" USING btree ("tenant_id","equipment_number");--> statement-breakpoint
CREATE INDEX "oog_spec_equip_location_idx" ON "oog_special_equipment" USING btree ("tenant_id","current_location");--> statement-breakpoint
CREATE INDEX "oog_spec_equip_status_idx" ON "oog_special_equipment" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "oog_spec_equip_created_idx" ON "oog_special_equipment" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "oog_spec_equip_deleted_idx" ON "oog_special_equipment" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "oog_stow_plan_tenant_idx" ON "oog_stowage_plans" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "oog_stow_plan_ref_tenant_idx" ON "oog_stowage_plans" USING btree ("tenant_id","stowage_ref");--> statement-breakpoint
CREATE INDEX "oog_stow_plan_vessel_idx" ON "oog_stowage_plans" USING btree ("tenant_id","vessel_name");--> statement-breakpoint
CREATE INDEX "oog_stow_plan_container_idx" ON "oog_stowage_plans" USING btree ("tenant_id","container_number");--> statement-breakpoint
CREATE INDEX "oog_stow_plan_type_idx" ON "oog_stowage_plans" USING btree ("tenant_id","container_type");--> statement-breakpoint
CREATE INDEX "oog_stow_plan_status_idx" ON "oog_stowage_plans" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "oog_stow_plan_created_idx" ON "oog_stowage_plans" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "oog_stow_plan_deleted_idx" ON "oog_stowage_plans" USING btree ("deleted_at");