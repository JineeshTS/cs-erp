CREATE TABLE "ai_agent_model_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"model_id" uuid NOT NULL,
	"fallback_model_id" uuid,
	"temperature" numeric(3, 2) DEFAULT '0.70' NOT NULL,
	"max_output_tokens" integer,
	"system_prompt" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"provider_id" uuid NOT NULL,
	"model_id" varchar(100) NOT NULL,
	"display_name" varchar(150) NOT NULL,
	"model_type" varchar(30) DEFAULT 'chat' NOT NULL,
	"max_tokens" integer,
	"context_window" integer,
	"cost_per_1k_input" numeric(10, 6),
	"cost_per_1k_output" numeric(10, 6),
	"is_active" boolean DEFAULT true NOT NULL,
	"capabilities" jsonb,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"provider_name" varchar(50) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"api_key_encrypted" text,
	"api_endpoint" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"agent_id" uuid,
	"model_id" uuid,
	"provider_id" uuid,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"cost_usd" numeric(10, 6),
	"latency_ms" integer,
	"status" varchar(30) DEFAULT 'success' NOT NULL,
	"error_message" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_agent_model_assignments" ADD CONSTRAINT "ai_agent_model_assignments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agent_model_assignments" ADD CONSTRAINT "ai_agent_model_assignments_model_id_ai_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_models"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agent_model_assignments" ADD CONSTRAINT "ai_agent_model_assignments_fallback_model_id_ai_models_id_fk" FOREIGN KEY ("fallback_model_id") REFERENCES "public"."ai_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_models" ADD CONSTRAINT "ai_models_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_models" ADD CONSTRAINT "ai_models_provider_id_ai_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."ai_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_providers" ADD CONSTRAINT "ai_providers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_agent_model_assignments_tenant_id_idx" ON "ai_agent_model_assignments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ai_agent_model_assignments_agent_id_idx" ON "ai_agent_model_assignments" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "ai_agent_model_assignments_model_id_idx" ON "ai_agent_model_assignments" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "ai_models_tenant_id_idx" ON "ai_models" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ai_models_provider_id_idx" ON "ai_models" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "ai_models_model_id_idx" ON "ai_models" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "ai_providers_tenant_id_idx" ON "ai_providers" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ai_providers_provider_name_idx" ON "ai_providers" USING btree ("provider_name");--> statement-breakpoint
CREATE INDEX "ai_usage_logs_tenant_id_idx" ON "ai_usage_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ai_usage_logs_agent_id_idx" ON "ai_usage_logs" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "ai_usage_logs_model_id_idx" ON "ai_usage_logs" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "ai_usage_logs_provider_id_idx" ON "ai_usage_logs" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "ai_usage_logs_created_at_idx" ON "ai_usage_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ai_usage_logs_status_idx" ON "ai_usage_logs" USING btree ("status");