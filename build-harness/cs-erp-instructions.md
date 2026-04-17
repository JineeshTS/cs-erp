# CS ERP Build Instructions

## Architecture
- **Microservices** — each module = its own service
- **Subdomain:** cs-erp.codilla.ai
- **All work by Claude Code** — orchestrator (Tintumon) only manages sessions

## DB-First Principle
ALL context, memory, progress must be saved to PostgreSQL — not files:

### Tables needed (Claude Code must create these):
1. `cs_erp_modules` — id, name, description, priority, status, depends_on[], created_at
2. `cs_erp_features` — id, module_id, name, description, ai_automated, status
3. `cs_erp_requirements` — id, feature_id, module_id, title, description, priority, ai_agent, acceptance_criteria[], status
4. `cs_erp_build_progress` — id, module_id, phase (spec/kg/codegen/deploy), status, output, started_at, completed_at
5. `cs_erp_session_memory` — id, session_id, key, value (JSONB), created_at — agent memory per session
6. `cs_erp_context_index` — id, entity_type, entity_id, context_text, embedding vector — for semantic search

## MANDATORY MODULE: Admin Portal
Must be included as a dedicated module (MOD-ADM) covering:
- System configuration & settings management
- User & role management (create/edit/deactivate users, assign roles, DOA levels)
- Module enable/disable switches per entity (Qatar/Dubai/KSA/India)
- AI agent configuration (enable/disable agents, set thresholds, tune 95/5 split)
- Workflow & approval matrix configuration
- Rate & tariff administration
- Integration management (Oracle Fusion, DPW, Customs — connection status, logs, retry)
- Master data management (ports, vessels, customers, agents, commodities, container types)
- Audit log viewer (all user actions, AI decisions, overrides)
- Reports & dashboard builder
- Notification template management (email/SMS/WhatsApp templates)
- License & subscription management
- Data import/export tools
- System health dashboard (service status, queue depths, error rates)
- Feature flags & A/B testing controls

## Seeding Strategy — SMALL SESSIONS ONLY:
- Each Claude Code session = ONE module part = MAX 3-4 features = MAX 60-80 requirements
- Large modules split into PART1, PART2, PART3 etc.
- Feature IDs: FEAT-{MOD_NUM}-{PART_NUM}-{SEQ} e.g. FEAT-002-1-001
- Requirement IDs: REQ-{MOD_NUM}-{PART_NUM}-{SEQ} e.g. REQ-002-1-001
- Each session checks get_progress() first to avoid duplicates

## Build Phases per Module:
1. Spec saved to DB (multiple part sessions) → 2. KG nodes generated → 3. Code generated → 4. Deployed as microservice

## Progress Tracking:
- After every Claude Code session: update cs_erp_build_progress in DB
- Before every Claude Code session: read cs_erp_build_progress to know where to resume
- Never rely on files for continuity — DB only

## Existing Requirements (from ideation):
- Project ID: ba9f6985-39ff-4d27-84b1-3820772fce2f
- 15 modules, 42 requirements already in ideation_processing_sessions table
- Expand to 50-60 modules, 500+ features, 10000+ requirements
