CREATE TABLE "eqy_availability_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"plan_reference" varchar(50) NOT NULL,
	"trade_lane" varchar(100),
	"origin_port" varchar(255),
	"destination_port" varchar(255),
	"container_type" varchar(20),
	"container_size" varchar(10),
	"forecast_period_start" timestamp with time zone NOT NULL,
	"forecast_period_end" timestamp with time zone NOT NULL,
	"available_units" integer,
	"demand_forecast" integer,
	"surplus_deficit" integer,
	"recommended_action" varchar(30),
	"ai_confidence" numeric(5, 2),
	"ai_model" varchar(100),
	"executed_action" varchar(30),
	"execution_date" timestamp with time zone,
	"metadata" jsonb,
	"status" varchar(20) DEFAULT 'forecast' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eqy_container_fleet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"container_number" varchar(20) NOT NULL,
	"iso_type_code" varchar(10),
	"size_code" varchar(10) NOT NULL,
	"type_code" varchar(10) NOT NULL,
	"owner_code" varchar(10),
	"operator_code" varchar(10),
	"ownership_type" varchar(20) DEFAULT 'owned' NOT NULL,
	"current_location" varchar(255),
	"current_port" varchar(10),
	"current_status" varchar(20) DEFAULT 'available' NOT NULL,
	"last_movement_date" timestamp with time zone,
	"last_survey_date" timestamp with time zone,
	"build_date" timestamp with time zone,
	"manufacturer" varchar(255),
	"tare_weight_kg" integer,
	"max_gross_weight_kg" integer,
	"capacity_cbm" numeric(8, 2),
	"metadata" jsonb,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eqy_container_surveys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"survey_reference" varchar(50) NOT NULL,
	"container_number" varchar(20) NOT NULL,
	"container_fleet_id" uuid,
	"survey_type" varchar(30) DEFAULT 'condition' NOT NULL,
	"surveyor_name" varchar(255),
	"survey_company" varchar(255),
	"survey_date" timestamp with time zone NOT NULL,
	"survey_location" varchar(255),
	"overall_condition" varchar(20),
	"structural_grade" varchar(5),
	"floor_grade" varchar(5),
	"roof_grade" varchar(5),
	"door_grade" varchar(5),
	"damage_findings" jsonb,
	"photos" jsonb,
	"next_survey_due" timestamp with time zone,
	"metadata" jsonb,
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eqy_equipment_interchanges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"interchange_reference" varchar(50) NOT NULL,
	"interchange_type" varchar(20) NOT NULL,
	"container_number" varchar(20) NOT NULL,
	"container_fleet_id" uuid,
	"party_from" varchar(255) NOT NULL,
	"party_to" varchar(255) NOT NULL,
	"location_code" varchar(20),
	"location_name" varchar(255),
	"interchange_date" timestamp with time zone NOT NULL,
	"condition_in" varchar(20),
	"condition_out" varchar(20),
	"damage_remarks" text,
	"liability_party" varchar(255),
	"receipt_number" varchar(50),
	"metadata" jsonb,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eqy_gate_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"movement_reference" varchar(50) NOT NULL,
	"movement_type" varchar(20) NOT NULL,
	"container_number" varchar(20) NOT NULL,
	"container_fleet_id" uuid,
	"vehicle_plate" varchar(20),
	"driver_name" varchar(255),
	"transport_company" varchar(255),
	"seal_number" varchar(50),
	"vgm_weight_kg" integer,
	"gate_code" varchar(20),
	"lane_number" varchar(10),
	"inspection_result" varchar(20) DEFAULT 'pending',
	"codeco_message_id" varchar(50),
	"edi_reference" varchar(100),
	"movement_timestamp" timestamp with time zone,
	"metadata" jsonb,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eqy_leased_containers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"lease_reference" varchar(50) NOT NULL,
	"container_fleet_id" uuid,
	"container_number" varchar(20) NOT NULL,
	"lessor_name" varchar(255) NOT NULL,
	"lessor_code" varchar(20),
	"lease_type" varchar(20) DEFAULT 'master' NOT NULL,
	"lease_start_date" timestamp with time zone NOT NULL,
	"lease_end_date" timestamp with time zone,
	"daily_rate" integer,
	"monthly_rate" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"billing_cycle" varchar(20) DEFAULT 'monthly',
	"pick_up_location" varchar(255),
	"drop_off_location" varchar(255),
	"contract_terms" jsonb,
	"minimum_lease_days" integer,
	"penalty_rate" integer,
	"metadata" jsonb,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eqy_maintenance_repairs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"container_fleet_id" uuid,
	"container_number" varchar(20) NOT NULL,
	"mnr_reference" varchar(50) NOT NULL,
	"repair_type" varchar(30) DEFAULT 'structural' NOT NULL,
	"damage_code" varchar(20),
	"damage_location" varchar(100),
	"damage_description" text,
	"estimated_cost" integer,
	"actual_cost" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"repair_vendor" varchar(255),
	"depot_code" varchar(20),
	"depot_name" varchar(255),
	"inspection_date" timestamp with time zone,
	"repair_start_date" timestamp with time zone,
	"repair_complete_date" timestamp with time zone,
	"approval_status" varchar(20) DEFAULT 'pending',
	"metadata" jsonb,
	"status" varchar(20) DEFAULT 'reported' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eqy_on_hire_off_hire" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"contract_reference" varchar(50) NOT NULL,
	"container_number" varchar(20) NOT NULL,
	"container_fleet_id" uuid,
	"lessor_name" varchar(255),
	"lessee_name" varchar(255),
	"hire_type" varchar(20) NOT NULL,
	"on_hire_date" timestamp with time zone NOT NULL,
	"off_hire_date" timestamp with time zone,
	"on_hire_location" varchar(255),
	"off_hire_location" varchar(255),
	"daily_rate" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"total_days" integer,
	"total_cost" integer,
	"condition_on_hire" varchar(20),
	"condition_off_hire" varchar(20),
	"damage_charges" integer,
	"cleaning_charges" integer,
	"metadata" jsonb,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eqy_reefer_containers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"container_fleet_id" uuid,
	"container_number" varchar(20) NOT NULL,
	"reefer_unit_model" varchar(100),
	"reefer_unit_serial" varchar(100),
	"set_temperature" numeric(5, 1),
	"min_temperature" numeric(5, 1),
	"max_temperature" numeric(5, 1),
	"humidity" numeric(5, 1),
	"ventilation" varchar(20),
	"atmosphere" varchar(20) DEFAULT 'normal',
	"last_pti_date" timestamp with time zone,
	"next_pti_due" timestamp with time zone,
	"power_status" varchar(20) DEFAULT 'off',
	"current_temperature" numeric(5, 1),
	"fuel_type" varchar(20),
	"genset_required" boolean DEFAULT false,
	"metadata" jsonb,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eqy_repositioning_optimizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"optimization_run_id" varchar(50),
	"plan_reference" varchar(50),
	"origin_port" varchar(255) NOT NULL,
	"destination_port" varchar(255) NOT NULL,
	"container_type" varchar(20),
	"container_size" varchar(10),
	"quantity" integer DEFAULT 1,
	"transport_mode" varchar(20) DEFAULT 'vessel',
	"estimated_cost" integer,
	"estimated_days" integer,
	"estimated_carbon" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"ai_score" numeric(5, 2),
	"ai_model" varchar(100),
	"algorithm" varchar(50) DEFAULT 'genetic',
	"input_parameters" jsonb,
	"results" jsonb,
	"alternatives" jsonb,
	"selected_for_execution" boolean DEFAULT false,
	"execution_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eqy_repositioning_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"plan_reference" varchar(50) NOT NULL,
	"container_fleet_id" uuid,
	"container_number" varchar(20),
	"from_port" varchar(255) NOT NULL,
	"to_port" varchar(255) NOT NULL,
	"trade_lane" varchar(100),
	"estimated_cost" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"transport_mode" varchar(20) DEFAULT 'vessel' NOT NULL,
	"scheduled_date" timestamp with time zone,
	"completed_date" timestamp with time zone,
	"reason" varchar(30) DEFAULT 'demand' NOT NULL,
	"container_type" varchar(20),
	"container_size" varchar(10),
	"quantity" integer DEFAULT 1,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eqy_yard_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"yard_code" varchar(20) NOT NULL,
	"yard_name" varchar(255) NOT NULL,
	"terminal_code" varchar(20),
	"block_code" varchar(20),
	"bay_code" varchar(20),
	"row_code" varchar(20),
	"tier_code" varchar(20),
	"slot_capacity" integer DEFAULT 1,
	"current_occupancy" integer DEFAULT 0,
	"slot_type" varchar(20) DEFAULT 'dry' NOT NULL,
	"assigned_container_number" varchar(20),
	"assigned_container_id" uuid,
	"reserved_for" varchar(255),
	"reserved_until" timestamp with time zone,
	"metadata" jsonb,
	"status" varchar(20) DEFAULT 'available' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "eqy_availability_plans" ADD CONSTRAINT "eqy_availability_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eqy_container_fleet" ADD CONSTRAINT "eqy_container_fleet_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eqy_container_surveys" ADD CONSTRAINT "eqy_container_surveys_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eqy_container_surveys" ADD CONSTRAINT "eqy_container_surveys_container_fleet_id_eqy_container_fleet_id_fk" FOREIGN KEY ("container_fleet_id") REFERENCES "public"."eqy_container_fleet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eqy_equipment_interchanges" ADD CONSTRAINT "eqy_equipment_interchanges_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eqy_equipment_interchanges" ADD CONSTRAINT "eqy_equipment_interchanges_container_fleet_id_eqy_container_fleet_id_fk" FOREIGN KEY ("container_fleet_id") REFERENCES "public"."eqy_container_fleet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eqy_gate_movements" ADD CONSTRAINT "eqy_gate_movements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eqy_gate_movements" ADD CONSTRAINT "eqy_gate_movements_container_fleet_id_eqy_container_fleet_id_fk" FOREIGN KEY ("container_fleet_id") REFERENCES "public"."eqy_container_fleet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eqy_leased_containers" ADD CONSTRAINT "eqy_leased_containers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eqy_leased_containers" ADD CONSTRAINT "eqy_leased_containers_container_fleet_id_eqy_container_fleet_id_fk" FOREIGN KEY ("container_fleet_id") REFERENCES "public"."eqy_container_fleet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eqy_maintenance_repairs" ADD CONSTRAINT "eqy_maintenance_repairs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eqy_maintenance_repairs" ADD CONSTRAINT "eqy_maintenance_repairs_container_fleet_id_eqy_container_fleet_id_fk" FOREIGN KEY ("container_fleet_id") REFERENCES "public"."eqy_container_fleet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eqy_on_hire_off_hire" ADD CONSTRAINT "eqy_on_hire_off_hire_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eqy_on_hire_off_hire" ADD CONSTRAINT "eqy_on_hire_off_hire_container_fleet_id_eqy_container_fleet_id_fk" FOREIGN KEY ("container_fleet_id") REFERENCES "public"."eqy_container_fleet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eqy_reefer_containers" ADD CONSTRAINT "eqy_reefer_containers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eqy_reefer_containers" ADD CONSTRAINT "eqy_reefer_containers_container_fleet_id_eqy_container_fleet_id_fk" FOREIGN KEY ("container_fleet_id") REFERENCES "public"."eqy_container_fleet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eqy_repositioning_optimizations" ADD CONSTRAINT "eqy_repositioning_optimizations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eqy_repositioning_plans" ADD CONSTRAINT "eqy_repositioning_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eqy_repositioning_plans" ADD CONSTRAINT "eqy_repositioning_plans_container_fleet_id_eqy_container_fleet_id_fk" FOREIGN KEY ("container_fleet_id") REFERENCES "public"."eqy_container_fleet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eqy_yard_slots" ADD CONSTRAINT "eqy_yard_slots_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eqy_yard_slots" ADD CONSTRAINT "eqy_yard_slots_assigned_container_id_eqy_container_fleet_id_fk" FOREIGN KEY ("assigned_container_id") REFERENCES "public"."eqy_container_fleet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "eqy_availability_plans_tenant_id_idx" ON "eqy_availability_plans" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "eqy_availability_plans_ref_idx" ON "eqy_availability_plans" USING btree ("plan_reference");--> statement-breakpoint
CREATE INDEX "eqy_availability_plans_trade_lane_idx" ON "eqy_availability_plans" USING btree ("trade_lane");--> statement-breakpoint
CREATE INDEX "eqy_availability_plans_period_idx" ON "eqy_availability_plans" USING btree ("forecast_period_start","forecast_period_end");--> statement-breakpoint
CREATE INDEX "eqy_availability_plans_status_idx" ON "eqy_availability_plans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "eqy_container_fleet_tenant_id_idx" ON "eqy_container_fleet" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "eqy_container_fleet_container_number_idx" ON "eqy_container_fleet" USING btree ("container_number");--> statement-breakpoint
CREATE INDEX "eqy_container_fleet_current_port_idx" ON "eqy_container_fleet" USING btree ("current_port");--> statement-breakpoint
CREATE INDEX "eqy_container_fleet_current_status_idx" ON "eqy_container_fleet" USING btree ("current_status");--> statement-breakpoint
CREATE INDEX "eqy_container_fleet_ownership_type_idx" ON "eqy_container_fleet" USING btree ("ownership_type");--> statement-breakpoint
CREATE INDEX "eqy_container_fleet_status_idx" ON "eqy_container_fleet" USING btree ("status");--> statement-breakpoint
CREATE INDEX "eqy_container_fleet_type_code_idx" ON "eqy_container_fleet" USING btree ("type_code");--> statement-breakpoint
CREATE INDEX "eqy_container_surveys_tenant_id_idx" ON "eqy_container_surveys" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "eqy_container_surveys_ref_idx" ON "eqy_container_surveys" USING btree ("survey_reference");--> statement-breakpoint
CREATE INDEX "eqy_container_surveys_container_idx" ON "eqy_container_surveys" USING btree ("container_number");--> statement-breakpoint
CREATE INDEX "eqy_container_surveys_fleet_idx" ON "eqy_container_surveys" USING btree ("container_fleet_id");--> statement-breakpoint
CREATE INDEX "eqy_container_surveys_survey_type_idx" ON "eqy_container_surveys" USING btree ("survey_type");--> statement-breakpoint
CREATE INDEX "eqy_container_surveys_condition_idx" ON "eqy_container_surveys" USING btree ("overall_condition");--> statement-breakpoint
CREATE INDEX "eqy_container_surveys_status_idx" ON "eqy_container_surveys" USING btree ("status");--> statement-breakpoint
CREATE INDEX "eqy_equipment_interchanges_tenant_id_idx" ON "eqy_equipment_interchanges" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "eqy_equipment_interchanges_ref_idx" ON "eqy_equipment_interchanges" USING btree ("interchange_reference");--> statement-breakpoint
CREATE INDEX "eqy_equipment_interchanges_type_idx" ON "eqy_equipment_interchanges" USING btree ("interchange_type");--> statement-breakpoint
CREATE INDEX "eqy_equipment_interchanges_container_idx" ON "eqy_equipment_interchanges" USING btree ("container_number");--> statement-breakpoint
CREATE INDEX "eqy_equipment_interchanges_fleet_idx" ON "eqy_equipment_interchanges" USING btree ("container_fleet_id");--> statement-breakpoint
CREATE INDEX "eqy_equipment_interchanges_status_idx" ON "eqy_equipment_interchanges" USING btree ("status");--> statement-breakpoint
CREATE INDEX "eqy_gate_movements_tenant_id_idx" ON "eqy_gate_movements" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "eqy_gate_movements_ref_idx" ON "eqy_gate_movements" USING btree ("movement_reference");--> statement-breakpoint
CREATE INDEX "eqy_gate_movements_type_idx" ON "eqy_gate_movements" USING btree ("movement_type");--> statement-breakpoint
CREATE INDEX "eqy_gate_movements_container_idx" ON "eqy_gate_movements" USING btree ("container_number");--> statement-breakpoint
CREATE INDEX "eqy_gate_movements_fleet_idx" ON "eqy_gate_movements" USING btree ("container_fleet_id");--> statement-breakpoint
CREATE INDEX "eqy_gate_movements_status_idx" ON "eqy_gate_movements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "eqy_gate_movements_timestamp_idx" ON "eqy_gate_movements" USING btree ("movement_timestamp");--> statement-breakpoint
CREATE INDEX "eqy_leased_containers_tenant_id_idx" ON "eqy_leased_containers" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "eqy_leased_containers_ref_idx" ON "eqy_leased_containers" USING btree ("lease_reference");--> statement-breakpoint
CREATE INDEX "eqy_leased_containers_fleet_idx" ON "eqy_leased_containers" USING btree ("container_fleet_id");--> statement-breakpoint
CREATE INDEX "eqy_leased_containers_container_idx" ON "eqy_leased_containers" USING btree ("container_number");--> statement-breakpoint
CREATE INDEX "eqy_leased_containers_lessor_idx" ON "eqy_leased_containers" USING btree ("lessor_name");--> statement-breakpoint
CREATE INDEX "eqy_leased_containers_lease_type_idx" ON "eqy_leased_containers" USING btree ("lease_type");--> statement-breakpoint
CREATE INDEX "eqy_leased_containers_status_idx" ON "eqy_leased_containers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "eqy_maintenance_repairs_tenant_id_idx" ON "eqy_maintenance_repairs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "eqy_maintenance_repairs_fleet_idx" ON "eqy_maintenance_repairs" USING btree ("container_fleet_id");--> statement-breakpoint
CREATE INDEX "eqy_maintenance_repairs_container_idx" ON "eqy_maintenance_repairs" USING btree ("container_number");--> statement-breakpoint
CREATE INDEX "eqy_maintenance_repairs_ref_idx" ON "eqy_maintenance_repairs" USING btree ("mnr_reference");--> statement-breakpoint
CREATE INDEX "eqy_maintenance_repairs_repair_type_idx" ON "eqy_maintenance_repairs" USING btree ("repair_type");--> statement-breakpoint
CREATE INDEX "eqy_maintenance_repairs_status_idx" ON "eqy_maintenance_repairs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "eqy_maintenance_repairs_approval_idx" ON "eqy_maintenance_repairs" USING btree ("approval_status");--> statement-breakpoint
CREATE INDEX "eqy_on_hire_off_hire_tenant_id_idx" ON "eqy_on_hire_off_hire" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "eqy_on_hire_off_hire_ref_idx" ON "eqy_on_hire_off_hire" USING btree ("contract_reference");--> statement-breakpoint
CREATE INDEX "eqy_on_hire_off_hire_container_idx" ON "eqy_on_hire_off_hire" USING btree ("container_number");--> statement-breakpoint
CREATE INDEX "eqy_on_hire_off_hire_fleet_idx" ON "eqy_on_hire_off_hire" USING btree ("container_fleet_id");--> statement-breakpoint
CREATE INDEX "eqy_on_hire_off_hire_hire_type_idx" ON "eqy_on_hire_off_hire" USING btree ("hire_type");--> statement-breakpoint
CREATE INDEX "eqy_on_hire_off_hire_status_idx" ON "eqy_on_hire_off_hire" USING btree ("status");--> statement-breakpoint
CREATE INDEX "eqy_reefer_containers_tenant_id_idx" ON "eqy_reefer_containers" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "eqy_reefer_containers_fleet_idx" ON "eqy_reefer_containers" USING btree ("container_fleet_id");--> statement-breakpoint
CREATE INDEX "eqy_reefer_containers_container_idx" ON "eqy_reefer_containers" USING btree ("container_number");--> statement-breakpoint
CREATE INDEX "eqy_reefer_containers_power_status_idx" ON "eqy_reefer_containers" USING btree ("power_status");--> statement-breakpoint
CREATE INDEX "eqy_reefer_containers_status_idx" ON "eqy_reefer_containers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "eqy_repositioning_optimizations_tenant_id_idx" ON "eqy_repositioning_optimizations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "eqy_repositioning_optimizations_run_idx" ON "eqy_repositioning_optimizations" USING btree ("optimization_run_id");--> statement-breakpoint
CREATE INDEX "eqy_repositioning_optimizations_origin_idx" ON "eqy_repositioning_optimizations" USING btree ("origin_port");--> statement-breakpoint
CREATE INDEX "eqy_repositioning_optimizations_dest_idx" ON "eqy_repositioning_optimizations" USING btree ("destination_port");--> statement-breakpoint
CREATE INDEX "eqy_repositioning_optimizations_status_idx" ON "eqy_repositioning_optimizations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "eqy_repositioning_optimizations_algorithm_idx" ON "eqy_repositioning_optimizations" USING btree ("algorithm");--> statement-breakpoint
CREATE INDEX "eqy_repositioning_plans_tenant_id_idx" ON "eqy_repositioning_plans" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "eqy_repositioning_plans_ref_idx" ON "eqy_repositioning_plans" USING btree ("plan_reference");--> statement-breakpoint
CREATE INDEX "eqy_repositioning_plans_fleet_idx" ON "eqy_repositioning_plans" USING btree ("container_fleet_id");--> statement-breakpoint
CREATE INDEX "eqy_repositioning_plans_from_port_idx" ON "eqy_repositioning_plans" USING btree ("from_port");--> statement-breakpoint
CREATE INDEX "eqy_repositioning_plans_to_port_idx" ON "eqy_repositioning_plans" USING btree ("to_port");--> statement-breakpoint
CREATE INDEX "eqy_repositioning_plans_status_idx" ON "eqy_repositioning_plans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "eqy_yard_slots_tenant_id_idx" ON "eqy_yard_slots" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "eqy_yard_slots_yard_code_idx" ON "eqy_yard_slots" USING btree ("yard_code");--> statement-breakpoint
CREATE INDEX "eqy_yard_slots_terminal_code_idx" ON "eqy_yard_slots" USING btree ("terminal_code");--> statement-breakpoint
CREATE INDEX "eqy_yard_slots_slot_type_idx" ON "eqy_yard_slots" USING btree ("slot_type");--> statement-breakpoint
CREATE INDEX "eqy_yard_slots_assigned_container_idx" ON "eqy_yard_slots" USING btree ("assigned_container_id");--> statement-breakpoint
CREATE INDEX "eqy_yard_slots_status_idx" ON "eqy_yard_slots" USING btree ("status");--> statement-breakpoint
CREATE INDEX "eqy_yard_slots_position_idx" ON "eqy_yard_slots" USING btree ("block_code","bay_code","row_code","tier_code");