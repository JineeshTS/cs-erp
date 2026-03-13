CREATE TABLE IF NOT EXISTS acm_sanctions_screenings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  screening_ref varchar(50) NOT NULL,
  entity_name varchar(255) NOT NULL,
  entity_type varchar(30) NOT NULL DEFAULT 'individual', -- individual, company, vessel
  entity_id uuid, -- FK to screened entity (lead, customer, etc)
  entity_table varchar(100), -- which table (scm_leads, scm_customers, etc)
  screening_type varchar(30) NOT NULL DEFAULT 'standard', -- standard, enhanced, periodic
  lists_checked jsonb NOT NULL DEFAULT '["OFAC_SDN","EU_CONSOLIDATED","UN_CONSOLIDATED"]',
  match_status varchar(20) NOT NULL DEFAULT 'pending', -- pending, clear, potential_match, confirmed_match
  match_details jsonb, -- details of any matches found
  risk_score integer,
  screened_by varchar(255),
  screened_at timestamptz,
  reviewed_by varchar(255),
  reviewed_at timestamptz,
  resolution varchar(30), -- cleared, escalated, blocked
  resolution_notes text,
  next_screening_date timestamptz,
  status varchar(20) NOT NULL DEFAULT 'pending',
  metadata jsonb,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX acm_sanctions_screenings_tenant_idx ON acm_sanctions_screenings(tenant_id);
CREATE INDEX acm_sanctions_screenings_entity_idx ON acm_sanctions_screenings(entity_id);
CREATE INDEX acm_sanctions_screenings_match_status_idx ON acm_sanctions_screenings(match_status);
CREATE INDEX acm_sanctions_screenings_status_idx ON acm_sanctions_screenings(status);
