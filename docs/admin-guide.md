# CS-ERP Administration Guide

System administrators manage tenant configuration, user accounts, roles, AI providers, module settings, and system health through the Admin Portal module.

---

## Tenant Management

### Tenant Setup

Each tenant represents a shipping company or business unit with complete data isolation enforced by PostgreSQL Row-Level Security.

1. Navigate to **Admin Portal** > **Master Data Configs**
2. Configure company name, registration, tax IDs
3. Set up operational regions (Qatar, UAE, KSA, India)
4. Configure base currency and multi-currency support
5. Upload company logo and branding

### Tenant Configuration

| Setting | Description |
|---------|-------------|
| `default_currency` | Primary operating currency (QAR, AED, SAR, INR, USD) |
| `timezone` | Default timezone for date displays |
| `fiscal_year_start` | Month fiscal year begins (1-12) |
| `date_format` | Display format (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD) |
| `language` | Default language (en, ar) |
| `modules_enabled` | Which of the 61 modules are active |
| `ai_automation_level` | Default AI agent automation level (1-4) |

### Multi-Entity Structure

For shipping groups with multiple legal entities:

- Use the **Multi-Entity Legal Structure** module
- Configure parent-subsidiary relationships
- Set up intercompany transaction rules
- Define consolidation mappings

---

## User Management

### Creating Users

1. Navigate to **Admin** > **Users**
2. Click **Add User**
3. Enter email, full name, and department
4. Assign one or more roles
5. Set initial password (user must change on first login)

**API:** `POST /api/v1/admin/users`

### User Fields

| Field | Required | Description |
|-------|----------|-------------|
| `email` | Yes | Login identifier; must be unique per tenant |
| `full_name` | Yes | Display name |
| `role_ids` | Yes | One or more roles assigned |
| `department` | No | Organizational unit |
| `employee_id` | No | HR reference number |
| `is_active` | Yes | Active/deactivated toggle |
| `language` | No | Preferred language override |
| `timezone` | No | Preferred timezone override |

### Deactivating Users

Users are never deleted. Deactivate by setting `is_active = false`. This:

- Invalidates all active sessions immediately
- Prevents new logins
- Preserves audit trail and record ownership
- Can be re-activated at any time

**API:** `PATCH /api/v1/admin/users/[userId]` with `{ "is_active": false }`

---

## Role & Permission Management

### Built-in Roles

| Role | Description |
|------|-------------|
| `super_admin` | Full access to all modules and admin functions |
| `tenant_admin` | Full access within their tenant; no cross-tenant access |
| `operations_manager` | Booking, documentation, vessel operations |
| `finance_manager` | All finance modules |
| `commercial_manager` | Sales, pricing, contracts |
| `sales_executive` | CRM and pricing read/create |
| `documentation_clerk` | BL processing and document management |
| `vessel_planner` | Schedule, capacity, and fleet planning |
| `vessel_manager` | Fleet and technical operations |
| `compliance_officer` | Customs, DG, audit, and compliance modules |
| `hr_manager` | HR, payroll, and crew management |
| `portal_user` | Customer portal access only |
| `read_only` | View access across all modules |

### Custom Roles

1. Navigate to **Admin** > **Roles** > **Create Role**
2. Enter role name and description
3. Select permissions from the module/action matrix
4. Assign to users

### Permission Format

Permissions follow `{module}:{action}`:

```
booking:read          -- View bookings
booking:create        -- Create bookings
booking:update        -- Modify bookings
booking:delete        -- Soft-delete bookings
booking:approve       -- Approve booking workflows
booking:manage        -- Full booking administration
```

Available actions: `read`, `create`, `update`, `delete`, `approve`, `manage`

**API:** `POST /api/v1/admin/roles`, `PATCH /api/v1/admin/roles/[roleId]`

---

## AI Provider Configuration

### Setting Up Providers

1. Navigate to **Admin Portal** > **AI Agent Configs**
2. Click **Add Provider**
3. Select provider type (OpenAI, Anthropic, Azure OpenAI, Google, custom)
4. Enter API endpoint and API key
5. Select default model
6. Set rate limits (requests/minute, tokens/minute)
7. Configure cost tracking (cost per 1K input/output tokens)
8. Test connection

### Provider Failover

Configure failover order at **Admin > AI Providers > Failover**:

- Primary provider handles all requests
- Secondary activates on primary failure or rate limit
- Failover is automatic with no user impact

### Agent Configuration

Per-agent settings at **Admin > AI Agents**:

| Setting | Options |
|---------|---------|
| Automation Level | Autonomous, Semi-Autonomous, Assistive, Monitoring |
| Status | Active / Inactive |
| Schedule | Real-time, Hourly, Daily, Weekly |
| Budget | Max tokens per month |
| Notifications | On every action / On errors only / Off |
| Override Roles | Which roles can override agent decisions |
| Model Assignment | Provider + model combination |
| Parameters | Temperature, max tokens, timeout |

Monitor token usage and costs via `ai_usage_logs`.

---

## Module Configuration

### Enabling/Disabling Modules

1. Go to **Admin Portal** > **Module Configs**
2. Toggle modules on/off for your tenant
3. Configure module-specific settings

Disabled modules: hide from navigation, API routes return 404, background jobs pause, data is preserved.

### Feature Flags

1. Navigate to **Admin Portal** > **Feature Flags**
2. Create or toggle feature flags
3. Target specific users, roles, or percentages
4. Use for gradual rollouts or A/B testing

```
feature.ai_agents.enabled          -- Master AI toggle
feature.customer_portal.enabled    -- Portal access
feature.dark_mode.enabled          -- Dark mode option
feature.rtl_support.enabled        -- Arabic RTL layout
feature.export_pdf.enabled         -- PDF export
feature.bulk_operations.enabled    -- Bulk actions on tables
```

---

## Approval Workflows

### Setting Up Approval Matrices

1. Go to **Admin Portal** > **Approval Matrices**
2. Define approval rules per module and action
3. Set threshold-based routing (e.g., invoices > $50K require CFO approval)
4. Configure multi-level approval chains (sequential or parallel)
5. Set escalation timeouts

---

## Integration Management

### External System Connections

1. Navigate to **Admin Portal** > **Integration Endpoints**
2. Configure connections to external systems:
   - EDI partners (INTTRA, CargoSmart)
   - Banking systems (SWIFT, local payment networks)
   - Customs authorities (per country)
   - Port community systems
   - AIS vessel tracking providers
3. Set up webhook URLs for event notifications
4. Monitor integration health and error rates

---

## Notification Configuration

1. Go to **Admin Portal** > **Notification Configs**
2. Configure channels: email (SMTP), SMS (provider API), push, in-app
3. Set up notification rules per event type
4. Configure escalation paths for unacknowledged alerts
5. Customize notification templates

---

## System Health & Monitoring

### Health Endpoint

`GET /api/health` returns:

```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "uptime": "5d 12h 34m"
}
```

### Key Metrics

| Metric | Warning Threshold |
|--------|-------------------|
| API response time (p95) | > 500ms |
| Database connections | > 80% pool utilization |
| Redis memory | > 80% allocated |
| Background job queue depth | > 1000 pending |
| Error rate | > 1% of requests |
| Disk usage | > 85% |

### Audit Logs

All system actions are logged in **Admin Portal** > **Audit Logs**:

- User ID, action, entity type, entity ID
- Before/after values for mutations
- IP address and user agent
- Timestamp with timezone

Audit logs are immutable -- they cannot be modified or deleted. Filter by user, module, action type, or date range.

### Session Management

- View active sessions at **Admin > Sessions**
- Force-terminate specific sessions or all sessions for a user
- Session tokens: 15-minute access token, 30-day refresh token with rotation
- Idle timeout configurable per tenant (default: 30 minutes)

---

## Data Import/Export

- Navigate to **Admin Portal** > **Import/Export Jobs**
- Import master data (ports, vessels, customers) via CSV/Excel
- Export data for reporting or migration
- Large operations run as background jobs via BullMQ

---

## Backup & Recovery

- Database backups run automatically (daily full, continuous WAL archiving)
- Point-in-time recovery available
- Contact infrastructure team for restore requests
- Test restore procedures quarterly

See the [Deployment Guide](./deployment-guide.md) for detailed backup procedures.
