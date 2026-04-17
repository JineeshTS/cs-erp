# Task: Generate KG Nodes for MOD-000 (SaaS Foundation)

## Your job
Write and execute `/root/gen_mod000_kg.py` — a Python script that generates ALL Knowledge Graph nodes for MOD-000 and inserts them into the Codilla PostgreSQL database with full traceability.

## Database access
```python
import subprocess
def psql(sql):
    r = subprocess.run(
        ["docker","exec","-i","06-build-postgres-1","psql","-U","codilla","-d","codilla","-v","ON_ERROR_STOP=1"],
        input=sql, capture_output=True, text=True
    )
    if r.returncode != 0:
        raise Exception(r.stderr[:400])
    return r.stdout.strip()

def esc(s): return "$q$" + str(s).replace("$q$","") + "$q$"
```

## Project constants
- project_id: `ba9f6985-39ff-4d27-84b1-3820772fce2f`
- module_id: `MOD-000`
- stage: `fast`
- status: `draft`
- source_agent_id: `claude-code.kg-gen`
- confidence: `0.92`

## MOD-000 Features (from DB — DO NOT re-query, use these exactly):
```
FEAT-000-1-001  Authentication UI & Session Management     (10 requirements)
  R001 Login Page
  R002 Registration Invite-Only Signup
  R003 Email Verification Flow
  R004 Password Reset Flow
  R005 TOTP Multi-Factor Authentication
  R006 SAML 2.0 SSO Enterprise
  R007 OAuth2 SSO Google and Microsoft
  R008 Session Management
  R009 Account Lockout and Brute-Force Protection
  R010 Passwordless Magic Link Login

FEAT-000-1-002  Role-Based Access Control (RBAC)           (8 requirements)
  R001 System Roles Definition
  R002 Custom Role Creation
  R003 Permission Matrix
  R004 User-Role Assignment
  R005 Permission Enforcement Middleware
  R006 Module-Level Access Control
  R007 Field-Level Visibility Control
  R008 Audit Log for Access Events

FEAT-000-2-001  Multi-Tenant Architecture                  (8 requirements)
  R001 Tenant Company Data Model
  R002 Tenant Isolation Row-Level Security
  R003 Data Residency Selection
  R004 Subscription Tier Enforcement
  R005 Company Onboarding Wizard
  R006 Tenant Lifecycle Management
  R007 Cross-Tenant Super-Admin View
  R008 White-Label Domain Support

FEAT-000-2-002  Admin Panel                                (8 requirements)
  R001 User Management Interface
  R002 Invitation Management
  R003 Company Profile Settings
  R004 Module Activation Dashboard
  R005 System Configuration
  R006 Audit Log Viewer
  R007 API Keys Management
  R008 Billing and Subscription View

FEAT-000-3-001  Dashboard Shell & Navigation               (8 requirements)
  R001 Sidebar Navigation
  R002 Top Header Bar
  R003 Global Command Palette
  R004 Module Routing and Lazy Loading
  R005 Notification Centre
  R006 Dashboard Home Page
  R007 RTL and LTR Layout Switching
  R008 Theme and Accessibility

FEAT-000-3-002  Onboarding Flow & Company Setup            (6 requirements)
  R001 Company Setup Wizard
  R002 Setup Completion Checklist
  R003 Master Data Import Tool
  R004 User Onboarding Tour
  R005 Go-Live Readiness Assessment
  R006 In-App Help and Support
```

## KG Node types to generate

Generate nodes in this EXACT order (each type has an ID prefix):

### 1. Feature nodes (prefix: `F-000-`, type: `feature`)
One per cs_erp_feature. Content:
```json
{
  "feature_id": "FEAT-000-X-XXX",
  "module_id": "MOD-000",
  "description": "...",
  "acceptance_criteria": ["...", "..."],
  "dependencies": []
}
```
Minimum: 6 nodes (one per feature listed above)

### 2. Database nodes (prefix: `DB-000-`, type: `database`)
One per DB table needed for MOD-000. Include ALL tables for:
- users, user_sessions, user_mfa_secrets, user_mfa_backup_codes, password_reset_tokens
- companies, company_settings, company_subscriptions, company_domains
- roles, permissions, role_permissions, user_roles
- invitations, api_keys, audit_logs, notifications, notification_preferences
Content per node:
```json
{
  "table_name": "users",
  "description": "...",
  "columns": [
    {"name": "id", "type": "uuid", "nullable": false, "description": "Primary key"},
    ...
  ],
  "indexes": ["idx_users_email"],
  "foreign_keys": [{"column": "company_id", "references": "companies.id"}],
  "rls_policy": "company_id = current_setting('app.current_company_id')"
}
```
Minimum: 16 tables

### 3. API endpoint nodes (prefix: `API-000-`, type: `api_endpoint`)
REST endpoints for auth, users, roles, companies, notifications, admin.
Content:
```json
{
  "method": "POST",
  "path": "/api/auth/login",
  "description": "...",
  "auth_required": false,
  "request_body": {"email": "string", "password": "string", "mfa_code": "string?"},
  "response_body": {"access_token": "string", "refresh_token": "string"},
  "rate_limit": "10/min",
  "feature_id": "FEAT-000-1-001"
}
```
Minimum: 35 endpoints covering all 6 features

### 4. Screen nodes (prefix: `SC-000-`, type: `screen`)
UI pages/screens. Content:
```json
{
  "route": "/login",
  "title": "Login",
  "description": "...",
  "layout": "auth",
  "components": ["LoginForm", "LanguageToggle"],
  "data_sources": ["POST /api/auth/login"],
  "rtl_support": true,
  "feature_id": "FEAT-000-1-001"
}
```
Minimum: 18 screens

### 5. Component nodes (prefix: `C-000-`, type: `component`)
Reusable React components. Content:
```json
{
  "component_name": "LoginForm",
  "file_path": "components/auth/LoginForm.tsx",
  "description": "...",
  "props": [{"name": "onSuccess", "type": "() => void"}],
  "used_in_screens": ["SC-000-001"]
}
```
Minimum: 22 components

### 6. Tech decision nodes (prefix: `TD-000-`, type: `tech_decision`)
Architecture and technology choices for MOD-000. Content:
```json
{
  "decision": "Use JWT RS256 for access tokens, httpOnly cookies for refresh tokens",
  "rationale": "...",
  "alternatives_considered": ["Session-based auth", "JWT HS256"],
  "applies_to": ["FEAT-000-1-001", "FEAT-000-1-002"],
  "adr_number": "ADR-000-001"
}
```
Minimum: 8 decisions (auth strategy, session storage, RBAC model, multi-tenant isolation, data residency, RLS strategy, frontend framework, i18n/RTL approach)

### 7. User flow nodes (prefix: `FL-000-`, type: `user_flow`)
End-to-end user journeys. Content:
```json
{
  "flow_name": "Company Admin Onboarding",
  "description": "...",
  "actor": "Company Admin",
  "trigger": "Clicks invite link in email",
  "steps": [
    {"step": 1, "action": "...", "screen": "SC-000-XXX", "api": "API-000-XXX"},
    ...
  ],
  "success_outcome": "...",
  "failure_paths": [{"condition": "...", "resolution": "..."}]
}
```
Minimum: 10 flows

## Relationships to include
In `relationships` array of each node, link to related nodes:
- Feature nodes → related DB tables, APIs, screens
- DB nodes → feature that owns them
- API nodes → screen that calls them, feature they serve
- Screen nodes → components used, APIs called
- Component nodes → screens they appear in

## Insert into project_kg_nodes
```sql
INSERT INTO project_kg_nodes (
  project_id, node_id, node_type, name, stage, status, content,
  relationships, source_agent_id, confidence, version
) VALUES (
  'ba9f6985-39ff-4d27-84b1-3820772fce2f',
  'F-000-001', 'feature', 'Authentication UI & Session Management',
  'fast', 'draft',
  '{...}'::jsonb,
  '[{"target_id":"DB-000-001","relationship_type":"stores_data_in","description":"Users stored in users table"}]'::jsonb,
  'claude-code.kg-gen', 0.92, 1
) ON CONFLICT DO NOTHING;
```

## Insert into cs_erp_kg_links (MANDATORY for every node)
```sql
INSERT INTO cs_erp_kg_links (
  project_id, project_kg_node_id, kg_node_id, node_type,
  module_id, feature_id, requirement_id, agent_id
) VALUES (
  'ba9f6985-...',
  (SELECT id FROM project_kg_nodes WHERE node_id='F-000-001' AND project_id='ba9f6985-...'),
  'F-000-001', 'feature', 'MOD-000', 'FEAT-000-1-001', 'FEAT-000-1-001-R001',
  'claude-code.kg-gen'
);
```

Link rules:
- Feature node → link to ALL requirements of that feature (one row per requirement)
- DB table node → link to the feature that owns that table
- API node → link to feature_id from its content + primary requirement
- Screen node → link to feature_id + primary requirement
- Component node → link to the screen/feature that uses it
- TD/FL nodes → link to MOD-000 only (no specific feature/req needed — use NULL for feature_id/requirement_id)

## Quality validation (run at end of script)
Print this report:
```
=== MOD-000 KG Quality Report ===
Feature nodes:    X / 6 features covered
DB nodes:         X tables
API nodes:        X endpoints
Screen nodes:     X screens
Component nodes:  X components
Tech decisions:   X
User flows:       X
Total KG nodes:   X
Total KG links:   X
Features with 0 nodes: [list if any]
QUALITY: PASS / FAIL (pass = all 6 features covered + >=35 API + >=18 screens)
```

## Script structure
```python
#!/usr/bin/env python3
"""Generate KG nodes for MOD-000 — SaaS Foundation"""

import json, subprocess

PROJECT_ID = "ba9f6985-39ff-4d27-84b1-3820772fce2f"
MODULE_ID = "MOD-000"

def psql(sql): ...
def esc(s): ...
def insert_node(node_id, node_type, name, content, relationships, parent_node_id=None): ...
def link_node(kg_node_id, feature_id=None, requirement_id=None): ...

# --- FEATURE NODES ---
# F-000-001 through F-000-006

# --- DATABASE NODES ---
# DB-000-001 through DB-000-016+

# --- API ENDPOINT NODES ---
# API-000-001 through API-000-035+

# --- SCREEN NODES ---
# SC-000-001 through SC-000-018+

# --- COMPONENT NODES ---
# C-000-001 through C-000-022+

# --- TECH DECISION NODES ---
# TD-000-001 through TD-000-008+

# --- USER FLOW NODES ---
# FL-000-001 through FL-000-010+

# --- QUALITY REPORT ---
```

## Execution
After writing the script, run it:
```bash
python3 /root/gen_mod000_kg.py
```
Verify it exits 0 and prints QUALITY: PASS.

If any error, fix and re-run.

Output the final quality report when done.
Echo: MOD000_KG_DONE
