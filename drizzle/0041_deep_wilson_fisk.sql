CREATE TABLE "tcm_bank_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"account_ref" varchar(50) NOT NULL,
	"account_type" varchar(30) NOT NULL,
	"bank_name" varchar(255) NOT NULL,
	"account_number" varchar(50),
	"iban" varchar(50),
	"swift_code" varchar(20),
	"branch_name" varchar(255),
	"branch_code" varchar(50),
	"currency" varchar(3) DEFAULT 'QAR',
	"current_balance" numeric(18, 2),
	"available_balance" numeric(18, 2),
	"overdraft_limit" numeric(18, 2),
	"interest_rate" numeric(8, 4),
	"account_holder" varchar(255),
	"authorized_signatories" jsonb,
	"entity_id" varchar(100),
	"gl_account_code" varchar(50),
	"opening_date" timestamp with time zone,
	"closing_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tcm_bank_guarantees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"bg_ref" varchar(50) NOT NULL,
	"bg_type" varchar(30) NOT NULL,
	"issuing_bank" varchar(255),
	"applicant" varchar(255),
	"beneficiary" varchar(255),
	"guarantee_amount" numeric(18, 2),
	"currency" varchar(3) DEFAULT 'QAR',
	"issue_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"claim_deadline" timestamp with time zone,
	"margin_percentage" numeric(8, 4),
	"margin_amount" numeric(18, 2),
	"commission_rate" numeric(8, 4),
	"commission_amount" numeric(14, 2),
	"linked_contract_ref" varchar(100),
	"purpose" text,
	"terms_and_conditions" text,
	"claim_history" jsonb,
	"auto_renewal" boolean,
	"renewal_count" integer,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tcm_bank_reconciliations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"reconciliation_ref" varchar(50) NOT NULL,
	"reconciliation_type" varchar(30) NOT NULL,
	"bank_account_ref" varchar(100),
	"bank_name" varchar(255),
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"statement_balance" numeric(18, 2),
	"book_balance" numeric(18, 2),
	"reconciled_balance" numeric(18, 2),
	"unreconciled_items" integer,
	"matched_transactions" integer,
	"currency" varchar(3) DEFAULT 'QAR',
	"difference" numeric(18, 2),
	"adjustments" jsonb,
	"outstanding_checks" jsonb,
	"deposits_in_transit" jsonb,
	"reconciled_by" varchar(255),
	"reconciled_at" timestamp with time zone,
	"approved_by" varchar(255),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tcm_cash_pooling_sweeps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"sweep_ref" varchar(50) NOT NULL,
	"sweep_type" varchar(30) NOT NULL,
	"pool_name" varchar(255),
	"master_account_ref" varchar(100),
	"participating_accounts" jsonb,
	"sweep_direction" varchar(20),
	"trigger_balance" numeric(18, 2),
	"target_balance" numeric(18, 2),
	"sweep_amount" numeric(18, 2),
	"currency" varchar(3) DEFAULT 'QAR',
	"frequency" varchar(20),
	"last_executed_at" timestamp with time zone,
	"next_scheduled_at" timestamp with time zone,
	"interest_rate" numeric(8, 4),
	"total_pool_balance" numeric(18, 2),
	"execution_log" jsonb,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tcm_cash_positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"position_ref" varchar(50) NOT NULL,
	"position_type" varchar(30) NOT NULL,
	"position_date" timestamp with time zone,
	"currency" varchar(3) DEFAULT 'QAR',
	"opening_balance" numeric(18, 2),
	"total_inflows" numeric(18, 2),
	"total_outflows" numeric(18, 2),
	"closing_balance" numeric(18, 2),
	"net_cash_flow" numeric(18, 2),
	"minimum_balance" numeric(18, 2),
	"maximum_balance" numeric(18, 2),
	"inflow_breakdown" jsonb,
	"outflow_breakdown" jsonb,
	"bank_account_id" varchar(100),
	"entity_id" varchar(100),
	"variance" numeric(18, 2),
	"variance_percentage" numeric(8, 2),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tcm_fx_hedging_exposures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"hedge_ref" varchar(50) NOT NULL,
	"hedge_type" varchar(30) NOT NULL,
	"base_currency" varchar(3),
	"quote_currency" varchar(3),
	"notional_amount" numeric(18, 2),
	"hedged_amount" numeric(18, 2),
	"spot_rate" numeric(12, 6),
	"forward_rate" numeric(12, 6),
	"strike_rate" numeric(12, 6),
	"maturity_date" timestamp with time zone,
	"settlement_date" timestamp with time zone,
	"counterparty" varchar(255),
	"deal_reference" varchar(100),
	"hedge_effectiveness" numeric(8, 4),
	"unrealized_gain_loss" numeric(18, 2),
	"realized_gain_loss" numeric(18, 2),
	"exposure_type" varchar(50),
	"hedge_accounting_method" varchar(50),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tcm_intercompany_loans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"loan_ref" varchar(50) NOT NULL,
	"loan_type" varchar(30) NOT NULL,
	"lender_entity" varchar(255),
	"borrower_entity" varchar(255),
	"principal_amount" numeric(18, 2),
	"outstanding_balance" numeric(18, 2),
	"currency" varchar(3) DEFAULT 'QAR',
	"interest_rate" numeric(8, 4),
	"interest_type" varchar(30),
	"disbursement_date" timestamp with time zone,
	"maturity_date" timestamp with time zone,
	"repayment_frequency" varchar(20),
	"next_payment_date" timestamp with time zone,
	"total_interest_accrued" numeric(18, 2),
	"total_repayments" numeric(18, 2),
	"repayment_schedule" jsonb,
	"covenants" jsonb,
	"transfer_pricing_compliance" boolean,
	"arm_length_rate" numeric(8, 4),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tcm_letters_of_credit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"lc_ref" varchar(50) NOT NULL,
	"lc_type" varchar(30) NOT NULL,
	"issuing_bank" varchar(255),
	"advising_bank" varchar(255),
	"confirming_bank" varchar(255),
	"applicant" varchar(255),
	"beneficiary" varchar(255),
	"lc_amount" numeric(18, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"issue_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"shipment_deadline" timestamp with time zone,
	"presentation_period" integer,
	"partial_shipment" boolean,
	"transshipment" boolean,
	"terms_and_conditions" text,
	"required_documents" jsonb,
	"amendments" jsonb,
	"utilization_amount" numeric(18, 2),
	"available_amount" numeric(18, 2),
	"charges" numeric(14, 2),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "tcm_bank_accounts" ADD CONSTRAINT "tcm_bank_accounts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tcm_bank_guarantees" ADD CONSTRAINT "tcm_bank_guarantees_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tcm_bank_reconciliations" ADD CONSTRAINT "tcm_bank_reconciliations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tcm_cash_pooling_sweeps" ADD CONSTRAINT "tcm_cash_pooling_sweeps_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tcm_cash_positions" ADD CONSTRAINT "tcm_cash_positions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tcm_fx_hedging_exposures" ADD CONSTRAINT "tcm_fx_hedging_exposures_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tcm_intercompany_loans" ADD CONSTRAINT "tcm_intercompany_loans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tcm_letters_of_credit" ADD CONSTRAINT "tcm_letters_of_credit_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tcm_bank_acct_tenant_idx" ON "tcm_bank_accounts" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tcm_bank_acct_ref_idx" ON "tcm_bank_accounts" USING btree ("account_ref");--> statement-breakpoint
CREATE INDEX "tcm_bank_acct_status_idx" ON "tcm_bank_accounts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tcm_bank_acct_type_idx" ON "tcm_bank_accounts" USING btree ("account_type");--> statement-breakpoint
CREATE INDEX "tcm_bank_acct_currency_idx" ON "tcm_bank_accounts" USING btree ("currency");--> statement-breakpoint
CREATE INDEX "tcm_bg_tenant_idx" ON "tcm_bank_guarantees" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tcm_bg_ref_idx" ON "tcm_bank_guarantees" USING btree ("bg_ref");--> statement-breakpoint
CREATE INDEX "tcm_bg_status_idx" ON "tcm_bank_guarantees" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tcm_bg_type_idx" ON "tcm_bank_guarantees" USING btree ("bg_type");--> statement-breakpoint
CREATE INDEX "tcm_bank_recon_tenant_idx" ON "tcm_bank_reconciliations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tcm_bank_recon_ref_idx" ON "tcm_bank_reconciliations" USING btree ("reconciliation_ref");--> statement-breakpoint
CREATE INDEX "tcm_bank_recon_status_idx" ON "tcm_bank_reconciliations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tcm_bank_recon_period_idx" ON "tcm_bank_reconciliations" USING btree ("period_start");--> statement-breakpoint
CREATE INDEX "tcm_pool_sweep_tenant_idx" ON "tcm_cash_pooling_sweeps" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tcm_pool_sweep_ref_idx" ON "tcm_cash_pooling_sweeps" USING btree ("sweep_ref");--> statement-breakpoint
CREATE INDEX "tcm_pool_sweep_status_idx" ON "tcm_cash_pooling_sweeps" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tcm_pool_sweep_type_idx" ON "tcm_cash_pooling_sweeps" USING btree ("sweep_type");--> statement-breakpoint
CREATE INDEX "tcm_cash_pos_tenant_idx" ON "tcm_cash_positions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tcm_cash_pos_ref_idx" ON "tcm_cash_positions" USING btree ("position_ref");--> statement-breakpoint
CREATE INDEX "tcm_cash_pos_status_idx" ON "tcm_cash_positions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tcm_cash_pos_date_idx" ON "tcm_cash_positions" USING btree ("position_date");--> statement-breakpoint
CREATE INDEX "tcm_fx_hedge_tenant_idx" ON "tcm_fx_hedging_exposures" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tcm_fx_hedge_ref_idx" ON "tcm_fx_hedging_exposures" USING btree ("hedge_ref");--> statement-breakpoint
CREATE INDEX "tcm_fx_hedge_status_idx" ON "tcm_fx_hedging_exposures" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tcm_fx_hedge_type_idx" ON "tcm_fx_hedging_exposures" USING btree ("hedge_type");--> statement-breakpoint
CREATE INDEX "tcm_ic_loan_tenant_idx" ON "tcm_intercompany_loans" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tcm_ic_loan_ref_idx" ON "tcm_intercompany_loans" USING btree ("loan_ref");--> statement-breakpoint
CREATE INDEX "tcm_ic_loan_status_idx" ON "tcm_intercompany_loans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tcm_ic_loan_type_idx" ON "tcm_intercompany_loans" USING btree ("loan_type");--> statement-breakpoint
CREATE INDEX "tcm_lc_tenant_idx" ON "tcm_letters_of_credit" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tcm_lc_ref_idx" ON "tcm_letters_of_credit" USING btree ("lc_ref");--> statement-breakpoint
CREATE INDEX "tcm_lc_status_idx" ON "tcm_letters_of_credit" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tcm_lc_type_idx" ON "tcm_letters_of_credit" USING btree ("lc_type");