-- Migration 0071: Add entity binding + executor_mode columns to pe_e2e_step_instances
-- Schema has these columns (D-006) but DB migration was missing

ALTER TABLE pe_e2e_step_instances
  ADD COLUMN IF NOT EXISTS entity_table varchar(100),
  ADD COLUMN IF NOT EXISTS entity_id uuid,
  ADD COLUMN IF NOT EXISTS entity_action varchar(20),
  ADD COLUMN IF NOT EXISTS executor_mode varchar(20);
