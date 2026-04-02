CREATE TABLE "csp_payment_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"payment_id" uuid NOT NULL,
	"transaction_ref" varchar(100) NOT NULL,
	"transaction_type" varchar(30) NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"status" varchar(20) NOT NULL,
	"gateway_response" jsonb,
	"error_code" varchar(50),
	"error_message" text,
	"processed_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "csp_portal_booking_containers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"booking_id" uuid NOT NULL,
	"container_number" varchar(20),
	"container_type" varchar(30) NOT NULL,
	"seal_number" varchar(50),
	"weight" integer,
	"volume" integer,
	"cargo_description" text,
	"hazardous" boolean DEFAULT false NOT NULL,
	"temperature" integer,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "csp_portal_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"booking_ref" varchar(50) NOT NULL,
	"customer_id" uuid NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"origin_port" varchar(20) NOT NULL,
	"destination_port" varchar(20) NOT NULL,
	"cargo_type" varchar(50) NOT NULL,
	"cargo_description" text,
	"container_type" varchar(30),
	"container_count" integer DEFAULT 1 NOT NULL,
	"weight" integer,
	"volume" integer,
	"preferred_vessel_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"special_requirements" jsonb,
	"hazardous" boolean DEFAULT false NOT NULL,
	"temperature" integer,
	"incoterm" varchar(10),
	"confirmed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"cancellation_reason" text,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "csp_portal_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"document_ref" varchar(50) NOT NULL,
	"document_type" varchar(50) NOT NULL,
	"document_name" varchar(255) NOT NULL,
	"customer_id" uuid NOT NULL,
	"booking_id" uuid,
	"bl_number" varchar(50),
	"file_url" varchar(500),
	"file_size" integer,
	"mime_type" varchar(100),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"is_customer_visible" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp with time zone,
	"download_count" integer DEFAULT 0 NOT NULL,
	"last_downloaded_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "csp_portal_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_ref" varchar(50) NOT NULL,
	"customer_id" uuid NOT NULL,
	"booking_id" uuid,
	"invoice_type" varchar(30) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"subtotal" integer NOT NULL,
	"tax_amount" integer DEFAULT 0 NOT NULL,
	"total_amount" integer NOT NULL,
	"paid_amount" integer DEFAULT 0 NOT NULL,
	"balance_due" integer NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"due_date" timestamp with time zone,
	"issued_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"line_items" jsonb,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "csp_portal_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"payment_ref" varchar(50) NOT NULL,
	"invoice_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"payment_method" varchar(30) NOT NULL,
	"gateway_provider" varchar(50),
	"gateway_ref" varchar(255),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"processed_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"failure_reason" text,
	"refunded_at" timestamp with time zone,
	"refund_amount" integer,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "csp_shipment_tracking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tracking_number" varchar(50) NOT NULL,
	"booking_id" uuid,
	"bl_number" varchar(50),
	"container_number" varchar(20),
	"vessel_name" varchar(255),
	"voyage_number" varchar(50),
	"origin_port" varchar(20) NOT NULL,
	"destination_port" varchar(20) NOT NULL,
	"current_port" varchar(20),
	"current_status" varchar(30) DEFAULT 'booked' NOT NULL,
	"eta" timestamp with time zone,
	"ata" timestamp with time zone,
	"etd" timestamp with time zone,
	"atd" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "csp_tracking_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tracking_id" uuid NOT NULL,
	"event_code" varchar(30) NOT NULL,
	"event_description" text NOT NULL,
	"location" varchar(100),
	"port_code" varchar(20),
	"event_time" timestamp with time zone NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"details" jsonb,
	"notes" text,
	"metadata" jsonb,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "csp_payment_transactions" ADD CONSTRAINT "csp_payment_transactions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csp_payment_transactions" ADD CONSTRAINT "csp_payment_transactions_payment_id_csp_portal_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."csp_portal_payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csp_portal_booking_containers" ADD CONSTRAINT "csp_portal_booking_containers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csp_portal_booking_containers" ADD CONSTRAINT "csp_portal_booking_containers_booking_id_csp_portal_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."csp_portal_bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csp_portal_bookings" ADD CONSTRAINT "csp_portal_bookings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csp_portal_documents" ADD CONSTRAINT "csp_portal_documents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csp_portal_documents" ADD CONSTRAINT "csp_portal_documents_booking_id_csp_portal_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."csp_portal_bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csp_portal_invoices" ADD CONSTRAINT "csp_portal_invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csp_portal_invoices" ADD CONSTRAINT "csp_portal_invoices_booking_id_csp_portal_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."csp_portal_bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csp_portal_payments" ADD CONSTRAINT "csp_portal_payments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csp_portal_payments" ADD CONSTRAINT "csp_portal_payments_invoice_id_csp_portal_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."csp_portal_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csp_shipment_tracking" ADD CONSTRAINT "csp_shipment_tracking_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csp_shipment_tracking" ADD CONSTRAINT "csp_shipment_tracking_booking_id_csp_portal_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."csp_portal_bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csp_tracking_events" ADD CONSTRAINT "csp_tracking_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csp_tracking_events" ADD CONSTRAINT "csp_tracking_events_tracking_id_csp_shipment_tracking_id_fk" FOREIGN KEY ("tracking_id") REFERENCES "public"."csp_shipment_tracking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "csp_txn_tenant_id_idx" ON "csp_payment_transactions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "csp_txn_payment_id_idx" ON "csp_payment_transactions" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "csp_txn_ref_idx" ON "csp_payment_transactions" USING btree ("transaction_ref");--> statement-breakpoint
CREATE INDEX "csp_txn_type_idx" ON "csp_payment_transactions" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "csp_txn_status_idx" ON "csp_payment_transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "csp_bk_containers_tenant_id_idx" ON "csp_portal_booking_containers" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "csp_bk_containers_booking_id_idx" ON "csp_portal_booking_containers" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "csp_bk_containers_number_idx" ON "csp_portal_booking_containers" USING btree ("container_number");--> statement-breakpoint
CREATE INDEX "csp_bk_containers_status_idx" ON "csp_portal_booking_containers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "csp_bookings_tenant_id_idx" ON "csp_portal_bookings" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "csp_bookings_tenant_ref_idx" ON "csp_portal_bookings" USING btree ("tenant_id","booking_ref");--> statement-breakpoint
CREATE INDEX "csp_bookings_customer_id_idx" ON "csp_portal_bookings" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "csp_bookings_origin_idx" ON "csp_portal_bookings" USING btree ("origin_port");--> statement-breakpoint
CREATE INDEX "csp_bookings_dest_idx" ON "csp_portal_bookings" USING btree ("destination_port");--> statement-breakpoint
CREATE INDEX "csp_bookings_status_idx" ON "csp_portal_bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "csp_bookings_cargo_type_idx" ON "csp_portal_bookings" USING btree ("cargo_type");--> statement-breakpoint
CREATE INDEX "csp_docs_tenant_id_idx" ON "csp_portal_documents" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "csp_docs_tenant_ref_idx" ON "csp_portal_documents" USING btree ("tenant_id","document_ref");--> statement-breakpoint
CREATE INDEX "csp_docs_type_idx" ON "csp_portal_documents" USING btree ("document_type");--> statement-breakpoint
CREATE INDEX "csp_docs_customer_id_idx" ON "csp_portal_documents" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "csp_docs_booking_id_idx" ON "csp_portal_documents" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "csp_docs_bl_idx" ON "csp_portal_documents" USING btree ("bl_number");--> statement-breakpoint
CREATE INDEX "csp_docs_status_idx" ON "csp_portal_documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "csp_invoices_tenant_id_idx" ON "csp_portal_invoices" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "csp_invoices_tenant_ref_idx" ON "csp_portal_invoices" USING btree ("tenant_id","invoice_ref");--> statement-breakpoint
CREATE INDEX "csp_invoices_customer_id_idx" ON "csp_portal_invoices" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "csp_invoices_booking_id_idx" ON "csp_portal_invoices" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "csp_invoices_type_idx" ON "csp_portal_invoices" USING btree ("invoice_type");--> statement-breakpoint
CREATE INDEX "csp_invoices_status_idx" ON "csp_portal_invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "csp_invoices_due_date_idx" ON "csp_portal_invoices" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "csp_payments_tenant_id_idx" ON "csp_portal_payments" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "csp_payments_tenant_ref_idx" ON "csp_portal_payments" USING btree ("tenant_id","payment_ref");--> statement-breakpoint
CREATE INDEX "csp_payments_invoice_id_idx" ON "csp_portal_payments" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "csp_payments_customer_id_idx" ON "csp_portal_payments" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "csp_payments_method_idx" ON "csp_portal_payments" USING btree ("payment_method");--> statement-breakpoint
CREATE INDEX "csp_payments_status_idx" ON "csp_portal_payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "csp_payments_gateway_ref_idx" ON "csp_portal_payments" USING btree ("gateway_ref");--> statement-breakpoint
CREATE INDEX "csp_tracking_tenant_id_idx" ON "csp_shipment_tracking" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "csp_tracking_tenant_number_idx" ON "csp_shipment_tracking" USING btree ("tenant_id","tracking_number");--> statement-breakpoint
CREATE INDEX "csp_tracking_booking_id_idx" ON "csp_shipment_tracking" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "csp_tracking_bl_idx" ON "csp_shipment_tracking" USING btree ("bl_number");--> statement-breakpoint
CREATE INDEX "csp_tracking_container_idx" ON "csp_shipment_tracking" USING btree ("container_number");--> statement-breakpoint
CREATE INDEX "csp_tracking_status_idx" ON "csp_shipment_tracking" USING btree ("current_status");--> statement-breakpoint
CREATE INDEX "csp_tracking_origin_idx" ON "csp_shipment_tracking" USING btree ("origin_port");--> statement-breakpoint
CREATE INDEX "csp_tracking_dest_idx" ON "csp_shipment_tracking" USING btree ("destination_port");--> statement-breakpoint
CREATE INDEX "csp_events_tenant_id_idx" ON "csp_tracking_events" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "csp_events_tracking_id_idx" ON "csp_tracking_events" USING btree ("tracking_id");--> statement-breakpoint
CREATE INDEX "csp_events_code_idx" ON "csp_tracking_events" USING btree ("event_code");--> statement-breakpoint
CREATE INDEX "csp_events_time_idx" ON "csp_tracking_events" USING btree ("event_time");