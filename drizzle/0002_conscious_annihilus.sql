CREATE TABLE "mdm_commodities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"hs_code" varchar(12) NOT NULL,
	"description" text NOT NULL,
	"short_description" varchar(255),
	"category" varchar(100),
	"chapter" varchar(10),
	"hazard_class" varchar(10),
	"un_number" varchar(10),
	"unit_of_measure" varchar(20) DEFAULT 'KG' NOT NULL,
	"requires_fumigation" boolean DEFAULT false NOT NULL,
	"requires_inspection" boolean DEFAULT false NOT NULL,
	"is_restricted" boolean DEFAULT false NOT NULL,
	"duty_rate" numeric(8, 4),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mdm_container_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"iso_code" varchar(10) NOT NULL,
	"description" varchar(255) NOT NULL,
	"size_type" varchar(10) NOT NULL,
	"length_ft" numeric(6, 2),
	"width_ft" numeric(6, 2),
	"height_ft" numeric(6, 2),
	"tare_weight_kg" numeric(10, 2),
	"max_payload_kg" numeric(10, 2),
	"cubic_capacity_cbm" numeric(10, 2),
	"is_reefer" boolean DEFAULT false NOT NULL,
	"is_open_top" boolean DEFAULT false NOT NULL,
	"is_flat_rack" boolean DEFAULT false NOT NULL,
	"is_tank" boolean DEFAULT false NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mdm_cost_centres" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"department" varchar(100),
	"description" text,
	"parent_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mdm_customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"parent_id" uuid,
	"customer_type" varchar(30) NOT NULL,
	"name" varchar(255) NOT NULL,
	"short_name" varchar(100),
	"tax_id" varchar(50),
	"registration_number" varchar(100),
	"country" varchar(2),
	"city" varchar(100),
	"address" text,
	"postal_code" varchar(20),
	"phone" varchar(30),
	"email" varchar(255),
	"website" varchar(255),
	"credit_limit_amount" integer,
	"credit_limit_currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"payment_terms_days" integer DEFAULT 30 NOT NULL,
	"contacts" jsonb DEFAULT '[]'::jsonb,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mdm_exchange_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"base_currency" varchar(3) NOT NULL,
	"target_currency" varchar(3) NOT NULL,
	"rate" numeric(18, 8) NOT NULL,
	"inverse_rate" numeric(18, 8),
	"source" varchar(50) DEFAULT 'manual' NOT NULL,
	"effective_date" date NOT NULL,
	"valid_until" date,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mdm_gl_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"account_code" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"account_type" varchar(20) NOT NULL,
	"parent_id" uuid,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"normal_balance" varchar(10) DEFAULT 'debit' NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mdm_ports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"un_locode" varchar(10) NOT NULL,
	"name" varchar(255) NOT NULL,
	"country" varchar(2) NOT NULL,
	"country_name" varchar(100),
	"timezone" varchar(50),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"port_type" varchar(30) DEFAULT 'seaport' NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"is_major_port" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mdm_tariff_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"code" varchar(30) NOT NULL,
	"description" text NOT NULL,
	"rate_type" varchar(20) NOT NULL,
	"rate_amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"per_unit" varchar(20) DEFAULT 'TEU' NOT NULL,
	"origin_port_id" uuid,
	"destination_port_id" uuid,
	"commodity_id" uuid,
	"container_type_id" uuid,
	"effective_from" date NOT NULL,
	"effective_to" date,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mdm_terminals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"port_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(20),
	"operator_name" varchar(255),
	"capacity" integer,
	"terminal_type" varchar(30) DEFAULT 'container' NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mdm_vessels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"imo_number" varchar(10) NOT NULL,
	"name" varchar(255) NOT NULL,
	"call_sign" varchar(20),
	"mmsi" varchar(15),
	"flag" varchar(2),
	"vessel_type" varchar(50) DEFAULT 'container' NOT NULL,
	"teu_capacity" integer,
	"dwt" numeric(12, 2),
	"gross_tonnage" numeric(12, 2),
	"net_tonnage" numeric(12, 2),
	"loa" numeric(8, 2),
	"beam" numeric(8, 2),
	"draft" numeric(8, 2),
	"built_year" integer,
	"builder" varchar(255),
	"owner_name" varchar(255),
	"operator_name" varchar(255),
	"classification_society" varchar(100),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mdm_commodities" ADD CONSTRAINT "mdm_commodities_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mdm_container_types" ADD CONSTRAINT "mdm_container_types_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mdm_cost_centres" ADD CONSTRAINT "mdm_cost_centres_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mdm_customers" ADD CONSTRAINT "mdm_customers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mdm_exchange_rates" ADD CONSTRAINT "mdm_exchange_rates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mdm_gl_accounts" ADD CONSTRAINT "mdm_gl_accounts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mdm_ports" ADD CONSTRAINT "mdm_ports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mdm_tariff_codes" ADD CONSTRAINT "mdm_tariff_codes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mdm_tariff_codes" ADD CONSTRAINT "mdm_tariff_codes_origin_port_id_mdm_ports_id_fk" FOREIGN KEY ("origin_port_id") REFERENCES "public"."mdm_ports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mdm_tariff_codes" ADD CONSTRAINT "mdm_tariff_codes_destination_port_id_mdm_ports_id_fk" FOREIGN KEY ("destination_port_id") REFERENCES "public"."mdm_ports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mdm_tariff_codes" ADD CONSTRAINT "mdm_tariff_codes_commodity_id_mdm_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "public"."mdm_commodities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mdm_tariff_codes" ADD CONSTRAINT "mdm_tariff_codes_container_type_id_mdm_container_types_id_fk" FOREIGN KEY ("container_type_id") REFERENCES "public"."mdm_container_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mdm_terminals" ADD CONSTRAINT "mdm_terminals_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mdm_terminals" ADD CONSTRAINT "mdm_terminals_port_id_mdm_ports_id_fk" FOREIGN KEY ("port_id") REFERENCES "public"."mdm_ports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mdm_vessels" ADD CONSTRAINT "mdm_vessels_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mdm_commodities_tenant_id_idx" ON "mdm_commodities" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mdm_commodities_tenant_hs_idx" ON "mdm_commodities" USING btree ("tenant_id","hs_code");--> statement-breakpoint
CREATE INDEX "mdm_commodities_category_idx" ON "mdm_commodities" USING btree ("category");--> statement-breakpoint
CREATE INDEX "mdm_commodities_hazard_idx" ON "mdm_commodities" USING btree ("hazard_class");--> statement-breakpoint
CREATE INDEX "mdm_container_types_tenant_id_idx" ON "mdm_container_types" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mdm_container_types_tenant_iso_idx" ON "mdm_container_types" USING btree ("tenant_id","iso_code");--> statement-breakpoint
CREATE INDEX "mdm_cost_centres_tenant_id_idx" ON "mdm_cost_centres" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mdm_cost_centres_tenant_code_idx" ON "mdm_cost_centres" USING btree ("tenant_id","code");--> statement-breakpoint
CREATE INDEX "mdm_cost_centres_parent_id_idx" ON "mdm_cost_centres" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "mdm_customers_tenant_id_idx" ON "mdm_customers" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "mdm_customers_parent_id_idx" ON "mdm_customers" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "mdm_customers_type_idx" ON "mdm_customers" USING btree ("customer_type");--> statement-breakpoint
CREATE INDEX "mdm_customers_country_idx" ON "mdm_customers" USING btree ("country");--> statement-breakpoint
CREATE INDEX "mdm_customers_status_idx" ON "mdm_customers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "mdm_exchange_rates_tenant_id_idx" ON "mdm_exchange_rates" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "mdm_exchange_rates_pair_idx" ON "mdm_exchange_rates" USING btree ("base_currency","target_currency");--> statement-breakpoint
CREATE INDEX "mdm_exchange_rates_effective_idx" ON "mdm_exchange_rates" USING btree ("effective_date");--> statement-breakpoint
CREATE INDEX "mdm_gl_accounts_tenant_id_idx" ON "mdm_gl_accounts" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mdm_gl_accounts_tenant_code_idx" ON "mdm_gl_accounts" USING btree ("tenant_id","account_code");--> statement-breakpoint
CREATE INDEX "mdm_gl_accounts_parent_id_idx" ON "mdm_gl_accounts" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "mdm_gl_accounts_type_idx" ON "mdm_gl_accounts" USING btree ("account_type");--> statement-breakpoint
CREATE INDEX "mdm_ports_tenant_id_idx" ON "mdm_ports" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mdm_ports_tenant_unlocode_idx" ON "mdm_ports" USING btree ("tenant_id","un_locode");--> statement-breakpoint
CREATE INDEX "mdm_ports_country_idx" ON "mdm_ports" USING btree ("country");--> statement-breakpoint
CREATE INDEX "mdm_ports_status_idx" ON "mdm_ports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "mdm_tariff_codes_tenant_id_idx" ON "mdm_tariff_codes" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mdm_tariff_codes_tenant_code_idx" ON "mdm_tariff_codes" USING btree ("tenant_id","code");--> statement-breakpoint
CREATE INDEX "mdm_tariff_codes_origin_idx" ON "mdm_tariff_codes" USING btree ("origin_port_id");--> statement-breakpoint
CREATE INDEX "mdm_tariff_codes_dest_idx" ON "mdm_tariff_codes" USING btree ("destination_port_id");--> statement-breakpoint
CREATE INDEX "mdm_tariff_codes_effective_idx" ON "mdm_tariff_codes" USING btree ("effective_from");--> statement-breakpoint
CREATE INDEX "mdm_terminals_tenant_id_idx" ON "mdm_terminals" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "mdm_terminals_port_id_idx" ON "mdm_terminals" USING btree ("port_id");--> statement-breakpoint
CREATE INDEX "mdm_vessels_tenant_id_idx" ON "mdm_vessels" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mdm_vessels_tenant_imo_idx" ON "mdm_vessels" USING btree ("tenant_id","imo_number");--> statement-breakpoint
CREATE INDEX "mdm_vessels_status_idx" ON "mdm_vessels" USING btree ("status");--> statement-breakpoint
CREATE INDEX "mdm_vessels_type_idx" ON "mdm_vessels" USING btree ("vessel_type");