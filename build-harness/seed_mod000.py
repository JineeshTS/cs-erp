#!/usr/bin/env python3
"""Seed MOD-000 — SaaS Foundation. Uses docker exec psql with dollar-quoting."""

import subprocess, sys

def psql(sql):
    r = subprocess.run(
        ["docker", "exec", "-i", "06-build-postgres-1",
         "psql", "-U", "codilla", "-d", "codilla", "-v", "ON_ERROR_STOP=1"],
        input=sql, capture_output=True, text=True
    )
    if r.returncode != 0:
        print("PSQL ERROR:", r.stderr[:600])
        sys.exit(1)
    return r.stdout.strip()

def esc(s):
    """Escape a string using PostgreSQL dollar-quoting."""
    # Use $q$ as delimiter (unlikely to appear in content)
    return "$q$" + str(s).replace("$q$", "") + "$q$"

FEATURES = [
    ("FEAT-000-1-001", "Authentication UI & Session Management",
     "Complete authentication interface including login, registration, MFA enrollment, SSO integration, and secure session handling. Supports email/password, TOTP, SAML 2.0, and OAuth2.",
     [
         ("FEAT-000-1-001-R001", "Login Page",
          "Email + password login form with client-side validation, show/hide password toggle, remember-me checkbox (30-day JWT), and CAPTCHA after 3 failed attempts. Arabic RTL + English LTR toggle on login screen."),
         ("FEAT-000-1-001-R002", "Registration Invite-Only Signup",
          "New user registration via invite link only (no open signup). Invite token (UUID v4) expires in 72h. Registration form collects: full name, work email, password (min 12 chars, complexity check), phone number. Send verification email on submit."),
         ("FEAT-000-1-001-R003", "Email Verification Flow",
          "On registration, send verification email with signed token (24h TTL). On click, verify token, activate account, redirect to onboarding. Resend option with 60s cooldown. Track email_verified_at timestamp."),
         ("FEAT-000-1-001-R004", "Password Reset Flow",
          "Forgot password: email form, send reset link (signed JWT, 1h TTL), reset form with new password and confirm, invalidate all active sessions, redirect to login. Rate-limit reset requests: max 3 per email per hour."),
         ("FEAT-000-1-001-R005", "TOTP Multi-Factor Authentication",
          "MFA enrollment: generate TOTP secret (RFC 6238), display QR code for Google Authenticator or Authy, require 2 consecutive valid codes to confirm enrollment. Store encrypted secret. On login: prompt TOTP after password. Backup codes: generate 10 one-time codes on enrollment, allow regeneration with MFA confirmation."),
         ("FEAT-000-1-001-R006", "SAML 2.0 SSO Enterprise",
          "Support SAML 2.0 SP-initiated and IdP-initiated SSO. Admin configures: IdP entity ID, SSO URL, SLO URL, X.509 certificate. Auto-provision user on first SSO login using SAML assertions (email, name, role). Tested with: Microsoft Entra ID, Okta, Google Workspace."),
         ("FEAT-000-1-001-R007", "OAuth2 SSO Google and Microsoft",
          "Social login via OAuth2: Google Workspace and Microsoft 365. On callback: match by email, link to existing account or auto-provision. Store provider and provider_user_id. Scopes: email and profile only. No posting permissions."),
         ("FEAT-000-1-001-R008", "Session Management",
          "JWT access token (15 min TTL) + refresh token (30 days, httpOnly cookie). Refresh rotation on each use. Maintain active sessions table: device name, IP, last_seen, user-agent. User can view and revoke individual sessions. Force-logout all sessions option. On password change: invalidate all refresh tokens."),
         ("FEAT-000-1-001-R009", "Account Lockout and Brute-Force Protection",
          "Lock account after 5 failed login attempts within 15 min. Lock duration: 15 min auto-unlock. Admin can manually unlock. Log all failed attempts with IP and timestamp. Alert user by email on lockout. Captcha after 3 failed attempts using hCaptcha."),
         ("FEAT-000-1-001-R010", "Passwordless Magic Link Login",
          "Optional: user requests magic link via email. Link contains signed JWT (10 min TTL, single-use). On click: verify, create session, redirect to dashboard. Auto-expire on use. Rate-limit: 3 magic links per email per hour."),
     ]),
    ("FEAT-000-1-002", "Role-Based Access Control (RBAC)",
     "Granular permission system with hierarchical roles. Supports super-admin, company-admin, module-specific roles, and custom role creation. All access decisions logged for audit.",
     [
         ("FEAT-000-1-002-R001", "System Roles Definition",
          "Built-in non-deletable roles: SUPER_ADMIN (full system access), COMPANY_ADMIN (full company access), FINANCE_MANAGER, OPERATIONS_MANAGER, SALES_MANAGER, CUSTOMER_SERVICE_AGENT, READONLY_VIEWER. Roles are hierarchical: COMPANY_ADMIN inherits all module manager permissions."),
         ("FEAT-000-1-002-R002", "Custom Role Creation",
          "Company admins can create custom roles: name, description, select permissions from permission matrix. Max 50 custom roles per company. Custom roles can inherit from a base role. Version-controlled: track who created/modified and when."),
         ("FEAT-000-1-002-R003", "Permission Matrix",
          "Permissions structured as resource:action pairs (e.g., booking:create, invoice:approve, report:export). Resources map to CS ERP modules. Actions: view, create, edit, delete, approve, export, configure. UI: checkbox grid of resource x action. Export permission matrix to PDF."),
         ("FEAT-000-1-002-R004", "User-Role Assignment",
          "Assign one or more roles to a user within a company. Role assignments have optional expiry date. Assignment history tracked. Notify user by email when role changes. Bulk assignment: upload CSV with user email + role name."),
         ("FEAT-000-1-002-R005", "Permission Enforcement Middleware",
          "Server-side middleware checks JWT claims against required permission for every protected route. Deny with 403 and log the attempt. Frontend: hide UI elements based on user permissions fetched on login. Never rely on frontend-only checks for security."),
         ("FEAT-000-1-002-R006", "Module-Level Access Control",
          "Each CS ERP module can be enabled/disabled per company subscription tier. Users with correct role but module not enabled see upgrade prompt. Super-admin can enable individual modules per company independent of subscription."),
         ("FEAT-000-1-002-R007", "Field-Level Visibility Control",
          "Certain fields (e.g., salary, margin %) visible only to specific roles. Define field visibility rules per role in configuration. Applied in API response serialization, never in UI-only filtering. Finance fields hidden from non-finance roles."),
         ("FEAT-000-1-002-R008", "Audit Log for Access Events",
          "Log every access-denied event with: user_id, resource, action, timestamp, IP, reason. Log every role/permission change with: who changed, what changed, before/after state, timestamp. Retain audit logs for 7 years. Queryable via admin panel with date/user/resource filters."),
     ]),
    ("FEAT-000-2-001", "Multi-Tenant Architecture",
     "Shared database with row-level security data isolation. Company onboarding, subscription management, data residency selection (Qatar / UAE / KSA / India data centres), and tenant lifecycle management.",
     [
         ("FEAT-000-2-001-R001", "Tenant Company Data Model",
          "Each tenant is a company record: id (UUID), name, trade_name_arabic, commercial_registration_number, country (QA/AE/SA/IN), data_residency_region, subscription_tier, subscription_expires_at, status (active/suspended/trial/cancelled), created_at. Company has one primary_admin user."),
         ("FEAT-000-2-001-R002", "Tenant Isolation Row-Level Security",
          "All ERP data tables include company_id foreign key. PostgreSQL Row-Level Security (RLS) policies enforce company_id = current_setting app.current_company_id on all SELECT/INSERT/UPDATE/DELETE. Middleware sets app.current_company_id on every DB connection from request context."),
         ("FEAT-000-2-001-R003", "Data Residency Selection",
          "On company onboarding, admin selects data residency: Qatar (MEEZA cloud), UAE (G42 or AWS me-south-1), Saudi Arabia (STC cloud), India (AWS ap-south-1). Selection determines which DB replica is primary. Immutable after selection for legal compliance. Display data residency badge in admin panel."),
         ("FEAT-000-2-001-R004", "Subscription Tier Enforcement",
          "Tiers: Starter (up to 5 users, 3 modules), Professional (up to 50 users, 15 modules), Enterprise (unlimited). Enforce limits at: login (user count), module activation (module count), API (rate limits per tier). Show upgrade prompt when limit hit. Grace period: 7 days after subscription expiry before suspend."),
         ("FEAT-000-2-001-R005", "Company Onboarding Wizard",
          "5-step wizard: (1) Company details (name, registration, country, data residency), (2) Primary contact and admin account, (3) Subscription selection, (4) Logo and branding setup, (5) First module selection and go-live date. Progress saved at each step. Resume from where left off."),
         ("FEAT-000-2-001-R006", "Tenant Lifecycle Management",
          "States: trial, active, suspended, cancelled. Trial: 30 days full Professional access. Suspended: read-only access, data export available. Cancelled: data retained 90 days then purged (GDPR/PDPL compliant). Admin panel: manage lifecycle, send payment reminder emails, download invoice history."),
         ("FEAT-000-2-001-R007", "Cross-Tenant Super-Admin View",
          "Super-admin can view all companies, switch context to any company with audit trail logged, impersonate company admin with reason and 1h session. All impersonation actions tagged in audit log as [IMPERSONATED]. Cannot impersonate outside business hours without second super-admin approval."),
         ("FEAT-000-2-001-R008", "White-Label Domain Support",
          "Each company can configure custom domain (e.g., erp.globalshipping.qa) with CNAME pointing to CS ERP. System auto-provisions SSL via Let's Encrypt. Domain verified via DNS TXT record. Company logo and name shown instead of CS ERP branding when accessed via custom domain."),
     ]),
    ("FEAT-000-2-002", "Admin Panel",
     "Company-level admin panel for user management, role assignment, system configuration, audit logs, and module activation.",
     [
         ("FEAT-000-2-002-R001", "User Management Interface",
          "List all company users with: name, email, roles, last_login, status (active/invited/suspended). Actions: invite user, edit roles, suspend/reactivate, reset MFA, force password reset, remove user. Bulk actions: suspend multiple, export user list to CSV. Search and filter by role, status, last login date."),
         ("FEAT-000-2-002-R002", "Invitation Management",
          "Pending invitations list: email, invited_by, invited_at, expires_at, status. Actions: resend invite, revoke invite. Auto-resend reminder 24h before expiry. Max 100 pending invitations per company. Invitation link is single-use and tied to invited email only."),
         ("FEAT-000-2-002-R003", "Company Profile Settings",
          "Editable fields: logo (PNG/SVG max 2MB), trade name (Arabic + English), commercial registration with expiry alert, VAT number, default currency, default timezone, fiscal year start month, decimal precision for amounts. Primary language setting. Changes tracked in audit log."),
         ("FEAT-000-2-002-R004", "Module Activation Dashboard",
          "Grid view of all 60 CS ERP modules: icon, name, status (active/inactive/coming_soon), subscription requirement. One-click activate/deactivate per module within subscription tier. Show dependency warnings. Module activation triggers provisioning job."),
         ("FEAT-000-2-002-R005", "System Configuration",
          "Configurable settings per company: email notification preferences (digest vs real-time), default approval thresholds per module, currency display format, date format, AI agent confidence threshold (when to escalate to human), webhook endpoints for external integrations."),
         ("FEAT-000-2-002-R006", "Audit Log Viewer",
          "Searchable audit log: who, what, when, where (IP), result (success/denied). Filters: date range, user, action type, resource. Export to CSV or PDF. Highlight security events. Retain 7 years. Real-time streaming for live monitoring."),
         ("FEAT-000-2-002-R007", "API Keys Management",
          "Generate API keys for external integrations. Key has: name, permissions scope, expiry, IP allowlist. Revoke instantly. Last-used timestamp. Max 20 active API keys per company. Key shown only once on creation, hashed with SHA-256 for storage."),
         ("FEAT-000-2-002-R008", "Billing and Subscription View",
          "Current plan, next billing date, amount, payment method (masked card or bank transfer reference). Invoice history with PDF download. Upgrade/downgrade plan. Usage metrics: active users, storage used, API calls this month vs limit."),
     ]),
    ("FEAT-000-3-001", "Dashboard Shell & Navigation",
     "The main application shell that hosts all CS ERP modules. Responsive sidebar navigation, breadcrumbs, command palette, notification centre, and module routing with lazy loading.",
     [
         ("FEAT-000-3-001-R001", "Sidebar Navigation",
          "Collapsible sidebar: CS ERP logo, company name and logo, primary nav items (one per active module), settings, help. Group modules by category: Commercial, Operations, Finance, Compliance. Badge counts for unread notifications per module. Keyboard shortcut to toggle sidebar. Persist collapsed state in localStorage."),
         ("FEAT-000-3-001-R002", "Top Header Bar",
          "Fixed header: breadcrumb navigation, global search bar (Cmd+K), notifications bell with unread count badge, language toggle Arabic and English, user avatar menu (profile, settings, switch company, logout). Company name displayed. Currency and timezone shown in corner."),
         ("FEAT-000-3-001-R003", "Global Command Palette",
          "Cmd+K opens searchable command palette. Searches: recent pages, all modules, quick actions (create booking, create invoice, add customer). Keyboard navigable with arrow keys and Enter. Shows keyboard shortcut hints. Results ranked by recency and role-based access. Recent searches persisted per user."),
         ("FEAT-000-3-001-R004", "Module Routing and Lazy Loading",
          "Each module is a lazy-loaded route segment. Module shell renders within main content area. Module-level error boundaries so module crash does not crash shell. Loading skeleton during module load. Preserve module scroll position on back navigation. Deep-link support."),
         ("FEAT-000-3-001-R005", "Notification Centre",
          "Slide-out notification panel. Notifications: system alerts, approval requests, document ready, AI escalations, due invoices, custom reminders. Mark individual or all as read. Filter by type. Notification preferences per user. Real-time via WebSocket with 30s polling fallback. Max 500 unread before auto-archive."),
         ("FEAT-000-3-001-R006", "Dashboard Home Page",
          "Personalised home with greeting, date and day. Widget grid (drag-to-rearrange, save layout per user): KPI cards (booked TEUs today, revenue MTD, pending approvals, open disputes), recent activity feed, quick-action buttons (most used per user), AI insights card (anomalies, recommendations). Mobile responsive."),
         ("FEAT-000-3-001-R007", "RTL and LTR Layout Switching",
          "Full RTL layout when Arabic selected: sidebar on right, text right-aligned, icons mirrored, date/number formatting per locale. Instant switch without page reload. RTL CSS via dir=rtl attribute on html element. All components tested for RTL correctness. Arabic font: IBM Plex Arabic. English font: Inter."),
         ("FEAT-000-3-001-R008", "Theme and Accessibility",
          "Light and dark mode with system preference detection. Persist per-user. Colour contrast WCAG AA compliant. Keyboard-navigable all interactive elements. Focus rings visible. Screen reader labels on all icons. Font size user-adjustable (sm/md/lg). Reduced motion preference respected."),
     ]),
    ("FEAT-000-3-002", "Onboarding Flow & Company Setup",
     "Guided setup wizard for new companies and first-time users. Data import tools, module activation sequencing, and go-live checklist.",
     [
         ("FEAT-000-3-002-R001", "Company Setup Wizard",
          "Step-by-step wizard on first login: (1) Company profile (name Arabic+English, country, registration, VAT, logo), (2) Data residency selection with latency map, (3) Fiscal year and currency defaults, (4) First admin user profile completion, (5) Team invite up to 5 initial users, (6) Module selection for first activation. Progress bar. Can skip and return later."),
         ("FEAT-000-3-002-R002", "Setup Completion Checklist",
          "Persistent checklist widget on dashboard until 100% complete. Items: company profile complete, logo uploaded, first user invited, first module activated, payment method added, MFA enabled for admin, custom domain configured (optional). Dismiss permanently after 100%."),
         ("FEAT-000-3-002-R003", "Master Data Import Tool",
          "CSV/Excel import for: customers, vendors, ports, vessels, containers, employees. Template download per entity type. Validation on upload: duplicate check, required fields, format validation. Preview first 10 rows before confirm. Background import job with progress bar. Email notification on completion with success/error summary."),
         ("FEAT-000-3-002-R004", "User Onboarding Tour",
          "First-login interactive product tour per role: highlight sidebar, explain key modules for their role, show first action to take. Tour skippable. Restart tour from Help menu. Contextual tooltips on key UI elements for first 7 days."),
         ("FEAT-000-3-002-R005", "Go-Live Readiness Assessment",
          "Admin panel Go-Live Checklist: system checks all required master data imported (min thresholds), at least 2 admin users, MFA enabled for all admins, payment method confirmed, SSL certificate valid, all purchased modules activated. Show readiness score 0-100%. Generate PDF go-live report."),
         ("FEAT-000-3-002-R006", "In-App Help and Support",
          "Help centre: searchable knowledge base with markdown articles per module. Contextual help button on every page shows relevant article. Live chat widget during business hours 09:00-18:00 Gulf time. Support ticket creation from within app auto-attaches page URL, user role, last 5 actions. SLA tracking shown to user."),
     ]),
]

def seed():
    # --- Module ---
    mod_sql = f"""
INSERT INTO cs_erp_modules (id, name, service_name, port, description, depends_on)
VALUES (
  'MOD-000',
  'SaaS Foundation',
  'cs-erp-foundation',
  '3100',
  {esc('Core SaaS platform foundation for the CS ERP. Provides authentication, multi-tenant architecture, role-based access control, admin panel, dashboard shell, and onboarding flow. ALL other modules depend on this. Built for Qatar, Dubai, KSA, and India operations. Bilingual (Arabic RTL + English). Multi-currency (USD/AED/QAR/SAR/INR).')},
  ARRAY[]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, service_name=EXCLUDED.service_name,
  port=EXCLUDED.port, description=EXCLUDED.description,
  depends_on=EXCLUDED.depends_on;
"""
    psql(mod_sql)
    print("✓ MOD-000 inserted")

    total_feats = 0
    total_reqs  = 0

    for feat_id, feat_name, feat_desc, reqs in FEATURES:
        feat_sql = f"""
INSERT INTO cs_erp_features (id, module_id, name, description)
VALUES ({esc(feat_id)}, 'MOD-000', {esc(feat_name)}, {esc(feat_desc)})
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description;
"""
        psql(feat_sql)
        total_feats += 1

        for rid, rtitle, rdesc in reqs:
            req_sql = f"""
INSERT INTO cs_erp_requirements (id, feature_id, title, description)
VALUES ({esc(rid)}, {esc(feat_id)}, {esc(rtitle)}, {esc(rdesc)})
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description;
"""
            psql(req_sql)
            total_reqs += 1

        print(f"  ✓ {feat_id} ({len(reqs)} requirements)")

    # Verify
    counts = psql("""
SELECT
  (SELECT COUNT(*) FROM cs_erp_modules) as mods,
  (SELECT COUNT(*) FROM cs_erp_features WHERE module_id='MOD-000') as feats,
  (SELECT COUNT(*) FROM cs_erp_requirements WHERE feature_id LIKE 'FEAT-000%') as reqs;
""")
    print(f"\n✅ Done — {total_feats} features, {total_reqs} requirements seeded")
    print(f"DB state: {counts}")

if __name__ == "__main__":
    seed()
