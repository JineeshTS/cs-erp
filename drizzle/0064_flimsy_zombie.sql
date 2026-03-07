CREATE TABLE "aws_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"label" varchar(255) NOT NULL,
	"encrypted_access_key_id" text NOT NULL,
	"encrypted_secret_access_key" text NOT NULL,
	"region" varchar(30) NOT NULL,
	"is_valid" boolean DEFAULT false NOT NULL,
	"last_validated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aws_deployments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"credential_id" uuid NOT NULL,
	"stack_name" varchar(255) NOT NULL,
	"stack_id" varchar(500),
	"region" varchar(30) NOT NULL,
	"instance_size" varchar(30) NOT NULL,
	"custom_domain" varchar(255),
	"enable_backups" boolean DEFAULT true NOT NULL,
	"enable_monitoring" boolean DEFAULT true NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"status_reason" text,
	"outputs" jsonb,
	"deployed_url" varchar(500),
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"initiated_by" uuid,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aws_credentials" ADD CONSTRAINT "aws_credentials_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aws_deployments" ADD CONSTRAINT "aws_deployments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aws_deployments" ADD CONSTRAINT "aws_deployments_credential_id_aws_credentials_id_fk" FOREIGN KEY ("credential_id") REFERENCES "public"."aws_credentials"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aws_deployments" ADD CONSTRAINT "aws_deployments_initiated_by_users_id_fk" FOREIGN KEY ("initiated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "aws_credentials_tenant_id_idx" ON "aws_credentials" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "aws_credentials_tenant_label_idx" ON "aws_credentials" USING btree ("tenant_id","label");--> statement-breakpoint
CREATE INDEX "aws_deployments_tenant_id_idx" ON "aws_deployments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "aws_deployments_credential_id_idx" ON "aws_deployments" USING btree ("credential_id");--> statement-breakpoint
CREATE INDEX "aws_deployments_status_idx" ON "aws_deployments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "aws_deployments_initiated_by_idx" ON "aws_deployments" USING btree ("initiated_by");