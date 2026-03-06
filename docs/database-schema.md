# CS-ERP Database Schema Reference

**Database:** `cs_erp` (PostgreSQL)
**Total Tables:** 528+
**ORM:** Drizzle ORM with postgres-js driver
**Connection Pool:** PgBouncer

---

## Design Principles

- **Multi-tenant isolation** via `tenant_id` on every table with Row-Level Security (RLS) policies
- **Standard columns** on every table: `id` (UUID, `gen_random_uuid()`), `tenant_id` (FK), `created_at` (timestamptz), `updated_at` (timestamptz)
- **Soft deletes** via nullable `deleted_at` (timestamptz) -- never hard delete
- **All timestamps** use `timestamptz` (with timezone), never `timestamp`
- **Foreign key indexes** on all FK columns for query performance
- **Migrations** managed exclusively by `drizzle-kit`

---

## Table Counts by Module Group

### Core Platform (18 tables)

| Prefix | Module | Tables | Schema File |
|--------|--------|--------|-------------|
| `auth` | Authentication (users, sessions, audit) | 3 | `users.ts`, `sessions.ts`, `audit-log.ts` |
| `admin` | Admin Portal | 12 | `admin-portal.ts` |
| `cs` | Build Progress Tracking | 1 | (system) |
| `roles` | Roles & Permissions | 2 | `roles.ts`, `permissions.ts` |

### Sales & Commercial (67 tables)

| Prefix | Module | Tables |
|--------|--------|--------|
| `scm` | Sales & CRM | 12 |
| `cpm` | Commercial Pricing Management | 13 |
| `lrm` | Liner Revenue Management | 8 |
| `anm` | Agent Network Management | 8 |
| `cso` | Customer Service Operations | 12 |
| `csp` | Customer Portal | 8 |
| `firm` | Freight Invoice & Revenue | 6 |

### Vessel & Voyage (84 tables)

| Prefix | Module | Tables |
|--------|--------|--------|
| `svp` | Schedule & Voyage Planning | 8 |
| `cap` | Capacity & Voyage Management | 12 |
| `cvm` | Chartering & Vessel Management | 12 |
| `fdp` | Fleet Deployment Planning | 8 |
| `vpe` | Vessel Performance & Efficiency | 12 |
| `vtm` | Vessel Technical Management | 8 |
| `loc` | Liner Operations Control | 8 |
| `ltr` | Liner Trade Route Management | 8 |
| `vrs` | Voyage Results & Settlement | 8 |

### Container & Equipment (56 tables)

| Prefix | Module | Tables |
|--------|--------|--------|
| `eqy` | Equipment Control & Yard | 12 |
| `clm` | Container Leasing Management | 8 |
| `ecr` | Empty Container Repositioning (AI) | 8 |
| `rcm` | Reefer Container Management | 8 |
| `ddm` | Demurrage & Detention | 8 |
| `iot` | Real-Time IoT Asset Tracking | 12 |

### Port & Terminal (36 tables)

| Prefix | Module | Tables |
|--------|--------|--------|
| `pam` | Port Agency Management | 8 |
| `pda` | Port Disbursement Accounting | 8 |
| `ptt` | Port Tariff & Terminal Billing | 4 |
| `thm` | Transshipment Hub Management | 8 |
| `icd` | Intermodal & ICD Operations | 8 |

### Finance & Accounting (64 tables)

| Prefix | Module | Tables |
|--------|--------|--------|
| `glfr` | General Ledger & Financial Reporting | 8 |
| `apvm` | Accounts Payable & Vendor | 8 |
| `arcc` | Accounts Receivable & Credit Control | 8 |
| `cfm` | Costing & Financial Management | 12 |
| `tcm` | Treasury & Cash Management | 8 |
| `fam` | Fixed Assets Management | 8 |
| `mels` | Multi-Entity Legal Structure | 12 |

### Bunker & Fuel (10 tables)

| Prefix | Module | Tables |
|--------|--------|--------|
| `bfm` | Bunker Fuel Management | 10 |

### Compliance & Risk (72 tables)

| Prefix | Module | Tables |
|--------|--------|--------|
| `ccr` | Customs & Compliance Regulatory | 8 |
| `dgm` | Dangerous Goods Management | 8 |
| `env` | MARPOL & Environmental Compliance | 8 |
| `acm` | Audit & Compliance Management | 8 |
| `risk` | Loss Prevention & Risk Management | 8 |
| `icm` | Insurance & Claims Management | 8 |
| `ccm` | Cargo Claims Management | 8 |
| `sim` | Survey & Inspection Management | 8 |
| `ser` | Sustainability & ESG Reporting | 8 |

### Booking & Documentation (25 tables)

| Prefix | Module | Tables |
|--------|--------|--------|
| `odm` | Operations & Documentation | 8 |
| `dms` | Document Management System | 9 |
| `oog` | OOG & Special Cargo | 8 |

### HR & Procurement (24 tables)

| Prefix | Module | Tables |
|--------|--------|--------|
| `hps` | HR & Payroll (Shore Staff) | 8 |
| `crm` | Crew Management | 8 |
| `psc` | Procurement & Supply Chain | 8 |

### AI & Analytics (15 tables)

| Prefix | Module | Tables |
|--------|--------|--------|
| `aaf` | AI Agent Framework | 7 |
| `abi` | Analytics & Business Intelligence | 8 |

### Platform Services (49 tables)

| Prefix | Module | Tables |
|--------|--------|--------|
| `mdm` | Master Data Management | 12 |
| `wne` | Workflow & Notification Engine | 8 |
| `iel` | Integration & EDI Layer | 8 |
| `isf` | Infrastructure & Security | 5 |
| `ai` | AI Provider Management | 4 |
| `kmt` | Knowledge Management & Training | 8 |
| `mob` | Mobile Operations App | 4 |

---

## Common Table Patterns

### Standard Table Structure

Every table follows this base pattern:

```sql
CREATE TABLE {prefix}_{entity} (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  -- entity-specific columns --
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ,
  created_by  UUID REFERENCES users(id),
  updated_by  UUID REFERENCES users(id)
);
```

### Row-Level Security

All tables have RLS enabled with tenant isolation:

```sql
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON {table}
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### Common Column Types

| Column Pattern | Type | Usage |
|----------------|------|-------|
| `*_id` | `UUID` | Foreign key reference |
| `*_code` | `VARCHAR(20-50)` | Business identifier (e.g., booking number) |
| `*_date` | `DATE` | Calendar dates |
| `*_at` | `TIMESTAMPTZ` | Timestamps with timezone |
| `*_amount` | `NUMERIC(18,4)` | Monetary amounts |
| `*_qty` | `NUMERIC(12,4)` | Quantities (weight, volume) |
| `*_rate` | `NUMERIC(12,6)` | Exchange rates, percentages |
| `status` | `VARCHAR(30)` | Workflow status enum |
| `notes` | `TEXT` | Free-text notes |
| `metadata` | `JSONB` | Flexible metadata storage |

### Status Enums by Domain

| Domain | Common Statuses |
|--------|----------------|
| Booking | `draft`, `confirmed`, `amended`, `cancelled`, `shipped` |
| Financial | `draft`, `pending_approval`, `approved`, `posted`, `voided` |
| Workflow | `pending`, `in_progress`, `completed`, `rejected`, `escalated` |
| Document | `draft`, `issued`, `surrendered`, `released`, `archived` |
| Vessel | `scheduled`, `departed`, `in_transit`, `arrived`, `completed` |

---

## Schema File Location

All Drizzle schema files are in: `src/db/schema/{module-slug}.ts`

The barrel export is at: `src/db/schema/index.ts`

Migration files are in: `drizzle/` with metadata in `drizzle/meta/`

---

## Key Relationships

- `tenants` -- root entity; all other tables reference via `tenant_id`
- `users` -- linked to tenants; referenced as `created_by`/`updated_by` across all tables
- `mdm_ports` -- referenced by voyage, booking, and operations tables
- `mdm_vessels` -- referenced by voyage, chartering, and performance tables
- `mdm_currencies` -- referenced by all financial/pricing tables
- `scm_customers` -- referenced by booking, invoicing, AR, and portal tables
- `apvm_vendors` -- referenced by PO, disbursement, and AP tables
