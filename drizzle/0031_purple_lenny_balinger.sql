CREATE TABLE "icd_bonded_warehouses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"warehouse_ref" varchar(50) NOT NULL,
	"warehouse_name" varchar(255) NOT NULL,
	"warehouse_code" varchar(30),
	"warehouse_type" varchar(30) NOT NULL,
	"customs_license_number" varchar(100),
	"customs_license_expiry" timestamp with time zone,
	"location" varchar(255),
	"total_area_sqm" numeric(12, 2),
	"usable_area_sqm" numeric(12, 2),
	"storage_capacity_teu" integer,
	"current_occupancy_teu" integer,
	"temperature_controlled" boolean DEFAULT false,
	"temp_range_min" numeric(6, 2),
	"temp_range_max" numeric(6, 2),
	"hazmat_certified" boolean DEFAULT false,
	"security_level" varchar(20),
	"operating_hours_start" varchar(10),
	"operating_hours_end" varchar(10),
	"bond_period_days" integer,
	"daily_storage_rate" numeric(10, 2),
	"currency" varchar(3),
	"contact_name" varchar(255),
	"contact_phone" varchar(50),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "icd_dry_ports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"port_ref" varchar(50) NOT NULL,
	"port_name" varchar(255) NOT NULL,
	"port_code" varchar(20),
	"port_type" varchar(30) NOT NULL,
	"country" varchar(100),
	"city" varchar(100),
	"address" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"operator_name" varchar(255),
	"operator_code" varchar(50),
	"customs_zone_type" varchar(30),
	"storage_capacity_teu" integer,
	"current_occupancy_teu" integer,
	"rail_connected" boolean DEFAULT false,
	"gate_hours_start" varchar(10),
	"gate_hours_end" varchar(10),
	"contact_name" varchar(255),
	"contact_phone" varchar(50),
	"contact_email" varchar(255),
	"services_offered" jsonb,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "icd_haulage_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"rate_ref" varchar(50) NOT NULL,
	"rate_name" varchar(255) NOT NULL,
	"transport_mode" varchar(30) NOT NULL,
	"origin_location" varchar(255) NOT NULL,
	"destination_location" varchar(255) NOT NULL,
	"container_size" varchar(10),
	"container_type" varchar(30),
	"rate_per_unit" numeric(14, 2) NOT NULL,
	"rate_unit" varchar(20) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"fuel_surcharge_percent" numeric(5, 2),
	"tolls" numeric(10, 2),
	"additional_charges" jsonb,
	"carrier_name" varchar(255),
	"carrier_code" varchar(50),
	"valid_from" timestamp with time zone,
	"valid_to" timestamp with time zone,
	"minimum_charge" numeric(14, 2),
	"transit_time_days" integer,
	"terms_and_conditions" text,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "icd_last_mile_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"delivery_ref" varchar(50) NOT NULL,
	"booking_ref" varchar(50),
	"customer_name" varchar(255) NOT NULL,
	"customer_code" varchar(50),
	"container_number" varchar(20),
	"container_size" varchar(10),
	"cargo_description" text,
	"gross_weight_kg" numeric(12, 2),
	"delivery_type" varchar(30) NOT NULL,
	"pickup_location" varchar(255) NOT NULL,
	"delivery_address" text NOT NULL,
	"delivery_city" varchar(100),
	"delivery_postal_code" varchar(20),
	"delivery_contact_name" varchar(255),
	"delivery_contact_phone" varchar(50),
	"scheduled_delivery_at" timestamp with time zone,
	"actual_delivery_at" timestamp with time zone,
	"delivery_window_start" varchar(10),
	"delivery_window_end" varchar(10),
	"assigned_vehicle" varchar(50),
	"assigned_driver" varchar(255),
	"delivery_attempts" integer DEFAULT 0,
	"pod_url" varchar(500),
	"pod_signed_at" timestamp with time zone,
	"delivery_cost" numeric(14, 2),
	"currency" varchar(3),
	"failure_reason" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "icd_multimodal_bols" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"bol_ref" varchar(50) NOT NULL,
	"bol_number" varchar(50),
	"bol_type" varchar(30) NOT NULL,
	"shipper_name" varchar(255) NOT NULL,
	"shipper_address" text,
	"consignee_name" varchar(255) NOT NULL,
	"consignee_address" text,
	"notify_party_name" varchar(255),
	"notify_party_address" text,
	"place_of_receipt" varchar(255),
	"port_of_loading" varchar(255),
	"port_of_discharge" varchar(255),
	"place_of_delivery" varchar(255),
	"vessel_name" varchar(255),
	"voyage_number" varchar(50),
	"container_number" varchar(20),
	"container_type" varchar(30),
	"cargo_description" text,
	"gross_weight_kg" numeric(12, 2),
	"measurement_cbm" numeric(12, 3),
	"number_of_packages" integer,
	"package_type" varchar(50),
	"freight_terms" varchar(20),
	"freight_amount" numeric(14, 2),
	"currency" varchar(3),
	"transport_legs" jsonb,
	"issued_at" timestamp with time zone,
	"issued_by_name" varchar(255),
	"issued_at_place" varchar(255),
	"number_of_originals" integer DEFAULT 3,
	"surrendered" boolean DEFAULT false,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "icd_rail_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"rail_plan_ref" varchar(50) NOT NULL,
	"train_number" varchar(50),
	"train_operator" varchar(255),
	"origin_icd" varchar(255) NOT NULL,
	"destination_icd" varchar(255) NOT NULL,
	"route_description" text,
	"wagon_count" integer,
	"wagon_type" varchar(30),
	"total_capacity_teu" integer,
	"booked_teu" integer,
	"scheduled_departure_at" timestamp with time zone,
	"scheduled_arrival_at" timestamp with time zone,
	"actual_departure_at" timestamp with time zone,
	"actual_arrival_at" timestamp with time zone,
	"transit_time_days" integer,
	"container_manifest" jsonb,
	"wagon_assignments" jsonb,
	"railway_company" varchar(255),
	"booking_cutoff_at" timestamp with time zone,
	"estimated_cost" numeric(14, 2),
	"currency" varchar(3),
	"status" varchar(20) DEFAULT 'planning' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "icd_route_optimizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"optimization_ref" varchar(50) NOT NULL,
	"requested_by_name" varchar(255),
	"origin_location" varchar(255) NOT NULL,
	"destination_location" varchar(255) NOT NULL,
	"cargo_description" text,
	"container_size" varchar(10),
	"container_count" integer,
	"gross_weight_kg" numeric(12, 2),
	"required_delivery_at" timestamp with time zone,
	"optimization_criteria" varchar(30) NOT NULL,
	"route_options" jsonb,
	"selected_route_index" integer,
	"selected_route_summary" text,
	"estimated_cost" numeric(14, 2),
	"estimated_transit_days" integer,
	"estimated_carbon_kg" numeric(12, 2),
	"ai_model_used" varchar(100),
	"ai_confidence_score" numeric(5, 3),
	"constraints" jsonb,
	"currency" varchar(3),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "icd_truck_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"booking_ref" varchar(50) NOT NULL,
	"transporter_name" varchar(255) NOT NULL,
	"transporter_code" varchar(50),
	"driver_name" varchar(255),
	"driver_license" varchar(50),
	"driver_phone" varchar(50),
	"truck_plate_number" varchar(30),
	"trailer_plate_number" varchar(30),
	"truck_type" varchar(30),
	"container_number" varchar(20),
	"container_size" varchar(10),
	"cargo_description" text,
	"gross_weight_kg" numeric(12, 2),
	"pickup_location" varchar(255) NOT NULL,
	"delivery_location" varchar(255) NOT NULL,
	"scheduled_pickup_at" timestamp with time zone,
	"scheduled_delivery_at" timestamp with time zone,
	"actual_pickup_at" timestamp with time zone,
	"actual_delivery_at" timestamp with time zone,
	"gps_tracking_id" varchar(100),
	"distance_km" numeric(10, 2),
	"transport_cost" numeric(14, 2),
	"currency" varchar(3),
	"pod_signed_by_name" varchar(255),
	"pod_signed_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "icd_bonded_warehouses" ADD CONSTRAINT "icd_bonded_warehouses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icd_dry_ports" ADD CONSTRAINT "icd_dry_ports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icd_haulage_rates" ADD CONSTRAINT "icd_haulage_rates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icd_last_mile_deliveries" ADD CONSTRAINT "icd_last_mile_deliveries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icd_multimodal_bols" ADD CONSTRAINT "icd_multimodal_bols_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icd_rail_plans" ADD CONSTRAINT "icd_rail_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icd_route_optimizations" ADD CONSTRAINT "icd_route_optimizations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icd_truck_bookings" ADD CONSTRAINT "icd_truck_bookings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "icd_bonded_warehouses_tenant_idx" ON "icd_bonded_warehouses" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "icd_bonded_warehouses_ref_idx" ON "icd_bonded_warehouses" USING btree ("warehouse_ref");--> statement-breakpoint
CREATE INDEX "icd_bonded_warehouses_status_idx" ON "icd_bonded_warehouses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "icd_bonded_warehouses_type_idx" ON "icd_bonded_warehouses" USING btree ("warehouse_type");--> statement-breakpoint
CREATE INDEX "icd_bonded_warehouses_deleted_idx" ON "icd_bonded_warehouses" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "icd_dry_ports_tenant_idx" ON "icd_dry_ports" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "icd_dry_ports_port_ref_idx" ON "icd_dry_ports" USING btree ("port_ref");--> statement-breakpoint
CREATE INDEX "icd_dry_ports_status_idx" ON "icd_dry_ports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "icd_dry_ports_port_type_idx" ON "icd_dry_ports" USING btree ("port_type");--> statement-breakpoint
CREATE INDEX "icd_dry_ports_country_idx" ON "icd_dry_ports" USING btree ("country");--> statement-breakpoint
CREATE INDEX "icd_dry_ports_deleted_idx" ON "icd_dry_ports" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "icd_haulage_rates_tenant_idx" ON "icd_haulage_rates" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "icd_haulage_rates_ref_idx" ON "icd_haulage_rates" USING btree ("rate_ref");--> statement-breakpoint
CREATE INDEX "icd_haulage_rates_status_idx" ON "icd_haulage_rates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "icd_haulage_rates_mode_idx" ON "icd_haulage_rates" USING btree ("transport_mode");--> statement-breakpoint
CREATE INDEX "icd_haulage_rates_origin_idx" ON "icd_haulage_rates" USING btree ("origin_location");--> statement-breakpoint
CREATE INDEX "icd_haulage_rates_dest_idx" ON "icd_haulage_rates" USING btree ("destination_location");--> statement-breakpoint
CREATE INDEX "icd_haulage_rates_valid_idx" ON "icd_haulage_rates" USING btree ("valid_from","valid_to");--> statement-breakpoint
CREATE INDEX "icd_haulage_rates_deleted_idx" ON "icd_haulage_rates" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "icd_last_mile_tenant_idx" ON "icd_last_mile_deliveries" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "icd_last_mile_ref_idx" ON "icd_last_mile_deliveries" USING btree ("delivery_ref");--> statement-breakpoint
CREATE INDEX "icd_last_mile_status_idx" ON "icd_last_mile_deliveries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "icd_last_mile_customer_idx" ON "icd_last_mile_deliveries" USING btree ("customer_name");--> statement-breakpoint
CREATE INDEX "icd_last_mile_scheduled_idx" ON "icd_last_mile_deliveries" USING btree ("scheduled_delivery_at");--> statement-breakpoint
CREATE INDEX "icd_last_mile_deleted_idx" ON "icd_last_mile_deliveries" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "icd_multimodal_bols_tenant_idx" ON "icd_multimodal_bols" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "icd_multimodal_bols_ref_idx" ON "icd_multimodal_bols" USING btree ("bol_ref");--> statement-breakpoint
CREATE INDEX "icd_multimodal_bols_status_idx" ON "icd_multimodal_bols" USING btree ("status");--> statement-breakpoint
CREATE INDEX "icd_multimodal_bols_shipper_idx" ON "icd_multimodal_bols" USING btree ("shipper_name");--> statement-breakpoint
CREATE INDEX "icd_multimodal_bols_consignee_idx" ON "icd_multimodal_bols" USING btree ("consignee_name");--> statement-breakpoint
CREATE INDEX "icd_multimodal_bols_bol_number_idx" ON "icd_multimodal_bols" USING btree ("bol_number");--> statement-breakpoint
CREATE INDEX "icd_multimodal_bols_deleted_idx" ON "icd_multimodal_bols" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "icd_rail_plans_tenant_idx" ON "icd_rail_plans" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "icd_rail_plans_ref_idx" ON "icd_rail_plans" USING btree ("rail_plan_ref");--> statement-breakpoint
CREATE INDEX "icd_rail_plans_status_idx" ON "icd_rail_plans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "icd_rail_plans_origin_idx" ON "icd_rail_plans" USING btree ("origin_icd");--> statement-breakpoint
CREATE INDEX "icd_rail_plans_dest_idx" ON "icd_rail_plans" USING btree ("destination_icd");--> statement-breakpoint
CREATE INDEX "icd_rail_plans_departure_idx" ON "icd_rail_plans" USING btree ("scheduled_departure_at");--> statement-breakpoint
CREATE INDEX "icd_rail_plans_deleted_idx" ON "icd_rail_plans" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "icd_route_opt_tenant_idx" ON "icd_route_optimizations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "icd_route_opt_ref_idx" ON "icd_route_optimizations" USING btree ("optimization_ref");--> statement-breakpoint
CREATE INDEX "icd_route_opt_status_idx" ON "icd_route_optimizations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "icd_route_opt_origin_idx" ON "icd_route_optimizations" USING btree ("origin_location");--> statement-breakpoint
CREATE INDEX "icd_route_opt_dest_idx" ON "icd_route_optimizations" USING btree ("destination_location");--> statement-breakpoint
CREATE INDEX "icd_route_opt_criteria_idx" ON "icd_route_optimizations" USING btree ("optimization_criteria");--> statement-breakpoint
CREATE INDEX "icd_route_opt_deleted_idx" ON "icd_route_optimizations" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "icd_truck_bookings_tenant_idx" ON "icd_truck_bookings" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "icd_truck_bookings_ref_idx" ON "icd_truck_bookings" USING btree ("booking_ref");--> statement-breakpoint
CREATE INDEX "icd_truck_bookings_status_idx" ON "icd_truck_bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "icd_truck_bookings_transporter_idx" ON "icd_truck_bookings" USING btree ("transporter_name");--> statement-breakpoint
CREATE INDEX "icd_truck_bookings_pickup_idx" ON "icd_truck_bookings" USING btree ("scheduled_pickup_at");--> statement-breakpoint
CREATE INDEX "icd_truck_bookings_deleted_idx" ON "icd_truck_bookings" USING btree ("deleted_at");